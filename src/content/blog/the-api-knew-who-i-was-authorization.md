---
title: "The API Knew Who I Was, but Not What I Was Allowed to Touch"
description: "A practical AppSec story about broken object-level authorization, tenant isolation, Microsoft Entra ID, FastAPI, Rust, PostgreSQL, and the evidence a secure API should leave behind."
date: "2026-09-11"
---

## The request that looked completely legitimate

The support message was short: “An accountant opened an invoice that belonged to another customer.”

Nothing had crashed. There was no suspicious executable, no leaked password, and no dramatic alert from a security product. The user had signed in normally through Microsoft Entra ID. The access token had a valid signature. The API returned `200 OK`. Every component appeared to have done its job.

The problem was that the API had answered only one security question:

**Who is making this request?**

It had not answered the more important question:

**Is this caller allowed to perform this action on this specific object, for this tenant, right now?**

Imagine a multi-tenant financial application. An accountant signs in, opens invoice `841`, and sees a URL like this:

```text
GET /api/invoices/841
Authorization: Bearer eyJ...
```

They replace `841` with `842`. The token remains valid. The API looks up invoice `842` by its identifier and returns it. That invoice belongs to another firm.

The authentication system worked. The authorization system did not.

This is why application security work often begins after the login screen. Identity providers can establish a strong identity, require multifactor authentication, evaluate device risk, and issue carefully scoped tokens. But the application still owns the decision about whether that identity may read this invoice, change this role, download this document, or trigger this payment.

> A valid identity is evidence about the caller. It is not evidence that every requested object belongs to them.

This article follows that one invoice request through a React client, Entra ID, a FastAPI boundary, a Rust service, and PostgreSQL. The technology is illustrative. The security lesson is independent of the stack: object authorization must be explicit, tenant-aware, testable, and visible in operations.

![A valid token travels through the application, but a separate policy decision determines access to tenant data.](/blog-images/api-authorization/01-request-path.svg)

*Figure 1: Authentication establishes identity. Authorization evaluates the caller, action, tenant, and requested object.*

## Why this mistake survives professional teams

Broken authorization is rarely caused by a developer deciding that security does not matter. It grows from reasonable local assumptions.

The frontend team hides buttons that the current role should not use. The identity team configures Entra app roles. The API validates tokens. The data layer provides a convenient `get_by_id` function. The test suite confirms that unauthenticated requests receive `401`. Each layer has a security-shaped piece, so the whole system feels protected.

Then the pieces fail to form one complete decision.

A typical endpoint begins like this:

```python
@router.get("/invoices/{invoice_id}")
async def get_invoice(
    invoice_id: UUID,
    user: AuthenticatedUser = Depends(require_user),
) -> InvoiceResponse:
    invoice = await repository.get_by_id(invoice_id)
    if invoice is None:
        raise HTTPException(status_code=404)
    return InvoiceResponse.from_domain(invoice)
```

The code is tidy. Authentication is mandatory. The repository is abstracted. The response has a type. Yet `user` is never part of the lookup or decision. Any authenticated caller who learns an invoice identifier can ask for it.

Using UUIDs instead of sequential numbers does not repair the missing authorization. A UUID may make guessing less convenient, but identifiers appear in browser history, logs, exports, emails, screenshots, analytics events, support tickets, and API responses. Security cannot depend on an object identifier remaining unknown.

OWASP calls this **Broken Object Level Authorization**, or BOLA. It remains first in the [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) because APIs routinely accept an object identifier from a caller without verifying that the caller may access that object.

The same weakness is often called IDOR—Insecure Direct Object Reference. The terminology matters less than the missing check.

## The one-digit attack

Let us make the scenario concrete.

Northwind Audit and Contoso Accounting both use the same SaaS platform. Their records share tables but carry different `tenant_id` values. Alice works for Northwind. She is allowed to read invoices for Northwind engagements.

Her token contains a tenant-related claim, an immutable user identifier, the intended API audience, and an application role. After validation, the application maps those claims to an internal principal:

```python
@dataclass(frozen=True)
class Principal:
    subject_id: UUID
    entra_object_id: str
    home_tenant_id: str
    organization_id: UUID
    roles: frozenset[str]
```

Alice requests Northwind invoice `841`. The API performs this query:

```sql
SELECT id, organization_id, amount, status
FROM invoices
WHERE id = :invoice_id;
```

It succeeds. Later, Alice requests Contoso invoice `842`. The same query succeeds again because the database was asked only whether the object exists—not whether it exists inside Alice’s authorized boundary.

![Changing only the object identifier crosses a tenant boundary when the repository lookup is not scoped.](/blog-images/api-authorization/02-bola-path.svg)

*Figure 2: The unsafe lookup treats possession of an identifier as permission. The scoped lookup makes tenant ownership part of data access.*

This attack is quiet. Both requests contain valid tokens. Both use expected HTTP methods. Neither requires malicious payload syntax. A web application firewall may see two ordinary reads. A generic vulnerability scanner may never possess two tenants with which to test the boundary.

The most valuable test is almost embarrassingly simple:

```python
async def test_user_cannot_read_another_tenants_invoice(
    client: AsyncClient,
    northwind_user_token: str,
    contoso_invoice: Invoice,
) -> None:
    response = await client.get(
        f"/api/invoices/{contoso_invoice.id}",
        headers={"Authorization": f"Bearer {northwind_user_token}"},
    )

    assert response.status_code == 404
```

That test expresses a business invariant more clearly than a hundred lines of security configuration:

**A user from one organization cannot read an invoice owned by another organization.**

Why `404` rather than `403`? Either can be defensible. Returning `404` can avoid confirming that an object exists outside the caller’s boundary. The important thing is to choose deliberately, use it consistently, and ensure logs still distinguish “missing” from “denied” for authorized operators.

## Authentication and authorization are different systems

Authentication establishes an identity. Authorization decides what that identity may do.

The distinction sounds elementary, yet architecture diagrams frequently collapse both into a box labelled “Entra” or “IAM.” That box makes the application’s responsibility disappear visually before it disappears in code.

An API accepting Microsoft identity platform tokens should validate properties such as the signature, issuer, audience, and lifetime. Microsoft’s [claims-validation guidance](https://learn.microsoft.com/en-us/entra/identity-platform/claims-validation) also explains how claims such as tenant, subject, and actor participate in authorization decisions. Those checks establish whether the API should trust the token and how it should identify the caller.

They do not establish that invoice `842` belongs to the caller’s organization.

Likewise, a role such as `Invoice.Read` says something about the kind of operation a principal may perform. It does not automatically identify the set of invoice objects to which that role applies.

A useful access decision has at least four dimensions:

- **Principal:** Which person or workload is calling?
- **Action:** What operation are they attempting?
- **Resource:** Which specific invoice, customer, document, or assessment is affected?
- **Context:** For which tenant, relationship, time, risk level, or workflow state?

Role-based access control is good at broad action categories. Object relationships and tenant boundaries need additional policy.

For example, an auditor may have `Invoice.Read` but only for organizations assigned to their engagement. A finance administrator may edit billing details but not approve their own payment. A support engineer may view diagnostic metadata but not the uploaded evidence itself. A background job may update assessment status but must not read unrelated customer records.

If all of that is compressed into `if "Admin" in roles`, the system is not simple. It is merely hiding policy inside a powerful role.

## Treat token claims as input, not as the whole policy

Claims are useful, but they require discipline.

The API should validate that a token was issued by an authority it trusts, is intended for this API, has not expired, and contains the expected identity semantics. For multi-tenant Microsoft Entra applications, issuer and tenant handling requires particular care. Microsoft documents that multi-tenant applications must validate issuer information in relation to the token’s tenant claim rather than treating any structurally valid Microsoft-issued token as sufficient.

After validation, translate external claims into an internal security model. Avoid allowing controllers, repositories, and domain services to interpret raw JWT dictionaries independently. Otherwise, claim semantics spread throughout the codebase and drift.

```python
def build_principal(claims: ValidatedClaims, membership: Membership) -> Principal:
    if claims.tenant_id not in settings.allowed_entra_tenants:
        raise AuthenticationError("untrusted tenant")

    if not membership.active:
        raise AuthorizationError("inactive membership")

    return Principal(
        subject_id=membership.user_id,
        entra_object_id=claims.object_id,
        home_tenant_id=claims.tenant_id,
        organization_id=membership.organization_id,
        roles=frozenset(membership.application_roles),
    )
```

Notice that the application organization is resolved from an application-controlled membership record. The external identity proves who Alice is in Entra. The SaaS platform still owns the relationship between Alice and Northwind.

This matters when a customer changes organization membership, when a guest account belongs to a different home tenant, or when one identity legitimately participates in multiple application tenants. Equating an Entra directory tenant with every application tenant is convenient until the business model becomes more complicated than the identity directory.

## Put the tenant boundary into the query

The first durable repair is to remove unsafe repository methods from tenant-scoped code paths.

```python
async def get_for_organization(
    self,
    invoice_id: UUID,
    organization_id: UUID,
) -> Invoice | None:
    statement = (
        select(InvoiceModel)
        .where(InvoiceModel.id == invoice_id)
        .where(InvoiceModel.organization_id == organization_id)
    )
    row = await self.session.scalar(statement)
    return row.to_domain() if row else None
```

The endpoint now makes the security boundary explicit:

```python
@router.get("/invoices/{invoice_id}")
async def get_invoice(
    invoice_id: UUID,
    principal: Principal = Depends(require_principal),
) -> InvoiceResponse:
    require_role(principal, "Invoice.Read")

    invoice = await repository.get_for_organization(
        invoice_id=invoice_id,
        organization_id=principal.organization_id,
    )
    if invoice is None:
        raise HTTPException(status_code=404)

    return InvoiceResponse.from_domain(invoice)
```

Filtering after an unscoped fetch is weaker:

```python
invoice = await repository.get_by_id(invoice_id)
if invoice.organization_id != principal.organization_id:
    raise HTTPException(status_code=404)
```

It may enforce the endpoint decision, but sensitive data has already crossed the repository boundary. Future logging, caching, tracing, or exception handling can expose it. A developer may also forget the comparison in the next endpoint. Scoped retrieval makes the safe path the ordinary path.

For write operations, include the boundary in the mutation itself:

```sql
UPDATE invoices
SET status = :new_status,
    version = version + 1
WHERE id = :invoice_id
  AND organization_id = :organization_id
  AND version = :expected_version;
```

This combines tenant isolation with optimistic concurrency. A successful authorization check followed by an unscoped update is still an unsafe design if the target can change between the check and the mutation.

## A policy should read like the decision it protects

Tenant-scoped queries solve a large class of problems, but real authorization often requires relationships and workflow rules that do not belong in a route handler.

Consider a Rust service responsible for approval decisions:

```rust
pub struct AccessRequest<'a> {
    pub principal: &'a Principal,
    pub action: Action,
    pub resource: &'a Invoice,
}

pub fn authorize(request: &AccessRequest<'_>) -> Result<(), Denial> {
    if request.principal.organization_id != request.resource.organization_id {
        return Err(Denial::CrossTenant);
    }

    if !request.principal.permissions.contains(&request.action.permission()) {
        return Err(Denial::MissingPermission);
    }

    if request.action == Action::Approve
        && request.resource.created_by == request.principal.user_id
    {
        return Err(Denial::SeparationOfDuties);
    }

    Ok(())
}
```

Rust’s type system helps represent a complete request and forces callers to handle a denial. It does not invent the policy. The team must still identify the invariants, decide where they are enforced, and test them against business reality.

![Authorization proceeds through token validation, tenant membership, action permission, and object relationship before data is returned.](/blog-images/api-authorization/03-policy-boundary.svg)

*Figure 3: A useful policy decision narrows trust step by step and denies access when any required fact is missing.*

The policy should be centralized enough to stay consistent but close enough to the domain to understand the resource. A generic gateway can validate tokens and enforce coarse scopes. It usually cannot know that Alice created this invoice, that the engagement ended yesterday, or that approval requires a second person.

This is an important API-management boundary. Azure API Management can centralize token validation, rate limits, routing, versioning, and shared telemetry. It should not become an excuse to remove resource authorization from the service that owns the resource.

## The frontend is not an authorization boundary

A React application should hide or disable actions the user cannot perform. That improves usability and reduces accidental attempts. It is not security enforcement.

```tsx
{permissions.includes("Invoice.Approve") && (
  <button onClick={() => approveInvoice(invoice.id)}>
    Approve invoice
  </button>
)}
```

The browser belongs to the caller. They can change JavaScript, replay a captured request, call the API directly, or construct a new request from developer tools. Every protected operation must be authorized at the server.

The frontend still has a security role:

- avoid placing secrets or excessive personal data into client state;
- avoid exposing unauthorized objects through prefetched responses;
- handle `401`, `403`, and `404` without leaking details;
- clear tenant-specific caches when the active organization changes;
- prevent stale screens from submitting an action for the previous tenant;
- present denied actions honestly rather than failing silently.

Query cache keys deserve attention. This key is incomplete:

```tsx
useQuery({ queryKey: ["invoice", invoiceId], queryFn: loadInvoice })
```

If a user can switch organizations without a full reload, include the organization context:

```tsx
useQuery({
  queryKey: ["organization", organizationId, "invoice", invoiceId],
  queryFn: () => loadInvoice(organizationId, invoiceId),
})
```

The server remains authoritative, but correct cache ownership prevents data from one tenant being rendered briefly inside another tenant’s workspace.

## Defence in depth with PostgreSQL

Application-layer authorization is essential because it understands actions and business relationships. The database can add another boundary.

PostgreSQL Row-Level Security can restrict which rows a database session may read or change. A simplified policy might look like this:

```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY invoice_tenant_isolation ON invoices
USING (
  organization_id = current_setting('app.organization_id')::uuid
)
WITH CHECK (
  organization_id = current_setting('app.organization_id')::uuid
);
```

At the beginning of the transaction, the application sets the verified organization context. Queries that forget a tenant predicate then encounter a database-level restriction.

RLS is not free protection. Connection pooling, transaction boundaries, privileged database roles, background jobs, migrations, and session-setting cleanup all require careful design. A leaked tenant setting on a reused connection can create exactly the isolation failure the policy was meant to prevent.

Treat RLS as defence in depth, not as permission to stop reviewing application authorization. Test it through the real connection pool and include negative cross-tenant cases.

## Deny by default when context is incomplete

Distributed systems make authorization context inconvenient. That inconvenience tempts dangerous fallbacks.

Suppose the API can validate Alice’s token but the membership service times out. Should it permit invoice access based on the role claim alone? Suppose a cached membership is five minutes old and Alice was just removed from the engagement. Suppose the policy service returns an unfamiliar decision value after deployment.

For protected operations, uncertainty should normally deny access. OWASP authorization guidance and zero-trust principles converge on this point: access is explicit, resource-specific, and least-privileged—not inherited from network location or a previous successful login.

The denial still needs operational design. If every dependency outage becomes an unexplained `403`, responders may mistake availability failure for an attack. The external response can remain minimal while internal telemetry records a safe reason code.

```json
{
  "event": "authorization_decision",
  "decision": "deny",
  "reason": "membership_unavailable",
  "action": "invoice.read",
  "resource_type": "invoice",
  "organization_id_hash": "org_7f2...",
  "correlation_id": "req_91c..."
}
```

Do not log raw access tokens. Avoid logging invoice content, personal data, or identifiers that operators do not need. Security telemetry should explain the decision without creating a second sensitive dataset.

## Test the matrix, not only the happy path

Authorization tests need multiple identities, tenants, roles, and object relationships. One administrator token cannot prove tenant isolation.

A practical test matrix includes:

- owner reads an object in their tenant: allow;
- ordinary member reads an allowed object: allow;
- member reads another tenant’s object: deny;
- user with the right role but no resource relationship: deny;
- user with the relationship but wrong role: deny;
- removed or disabled membership: deny;
- app-only token sent to a delegated-user endpoint: deny;
- token for the wrong audience or issuer: deny;
- object identifier changed in path, query, and request body: deny;
- bulk endpoint containing one unauthorized identifier: reject or safely filter according to a documented contract;
- stale version used for a sensitive update: reject;
- policy dependency unavailable: deny safely and emit operational evidence.

Property-based tests can generate combinations the team did not manually enumerate. Integration tests should exercise the real repository filters. End-to-end tests should confirm that the API denies direct requests even when the React interface hides the control.

Static analysis and dependency scanning remain valuable, but they cannot infer every tenant relationship. A green scan is not proof that Alice cannot read Contoso’s invoice. The invariant needs a test with Alice and Contoso.

## Authorization failures are design feedback

When a cross-tenant test fails, the immediate response is to repair the endpoint. The stronger response is to ask how the unsafe pattern became easy.

Was `get_by_id` available in a tenant-aware repository? Did code review lack a resource-authorization prompt? Did the API specification describe authentication but not ownership? Were test fixtures limited to one tenant? Did logs make all denials indistinguishable? Did a generated endpoint copy an unsafe example?

This turns one finding into an organizational improvement:

- introduce tenant-scoped repository types;
- add negative authorization cases to API templates;
- record the decision in a security ADR;
- add a review rule for every caller-controlled object identifier;
- teach coding assistants the approved access pattern;
- search existing endpoints for the same unsafe lookup;
- connect the finding to service ownership and deployment inventory.

![Threat scenarios become policies, executable tests, and telemetry, then feed improvements into the next design.](/blog-images/api-authorization/04-evidence-loop.svg)

*Figure 4: A mature AppSec practice converts individual findings into reusable evidence and safer defaults.*

This is where application security becomes more than finding bugs. It becomes a feedback system for engineering.

## AI-generated code makes the safe default more important

Coding agents are good at extending visible patterns. If the repository contains ten endpoints that call `get_by_id`, an agent may produce the eleventh with impressive consistency. It cannot know that the pattern violates a tenant invariant unless the invariant exists in code, tests, documentation, or review instructions.

Treat generated code as an untrusted contribution—not because the model is malicious, but because plausible code can be confidently incomplete.

For authorization-sensitive changes, an AI review prompt should ask concrete questions:

- Which caller-controlled identifiers enter the request?
- Where is tenant membership resolved?
- Where is the action permission checked?
- Does the repository scope the query before data is loaded?
- Can app-only and delegated tokens reach the same endpoint?
- What happens when policy context is missing or stale?
- Which negative tests prove cross-tenant isolation?
- What decision evidence is logged, and does it contain sensitive data?

The best protection is not a longer prompt. It is an architecture where unsafe code is awkward to write: scoped repository methods, typed principals, explicit access requests, deny-by-default results, and reusable test fixtures with multiple tenants.

## Build it safely with AI

AI-assisted development is now mainstream, but generated security claims still need evidence. Use the following playbook with Claude Code, Codex, Copilot, or another repository-aware coding agent. Give the agent access only to the code and tools required for the review, and ask it to diagnose before it edits.

### Context to give the agent

- the authentication provider and accepted token types;
- the tenant and organization model;
- the sensitive resources and ownership relationships;
- the roles, permissions, and separation-of-duties rules;
- the API, service, and repository boundaries; and
- the commands used to run security and integration tests.

### Skills or review capabilities to use

- threat modelling;
- authentication and authorization review;
- API and tenant-isolation security;
- secure code review;
- database-access review; and
- negative security-test generation.

### Copyable review prompt

```text
Review this application for broken object-level authorization and tenant-isolation failures.

Trace every caller-controlled resource identifier through:
request → authentication → authorization → repository query → response or side effect.

For every affected endpoint:
1. Identify the principal, action, tenant, and resource.
2. Verify issuer, audience, lifetime, and token type.
3. Confirm that authorization is enforced server-side.
4. Confirm that database reads and writes are tenant-scoped.
5. Find unscoped methods such as get_by_id.
6. Check bulk operations, background jobs, caches, and app-only tokens.
7. Create negative cross-tenant tests.
8. Report only findings supported by a concrete code path.

Do not modify the code yet.

For each verified finding, return:
- affected files and functions;
- attack preconditions and a realistic abuse path;
- severity with justification;
- the smallest safe remediation; and
- a test that proves the remediation works.
```

### Verification before accepting the result

- [ ] The agent followed a real code path rather than matching keywords.
- [ ] Authentication and authorization were evaluated separately.
- [ ] Tenant ownership was enforced by the server.
- [ ] Data was scoped before it was loaded, changed, cached, or logged.
- [ ] At least one negative cross-tenant test was executed.
- [ ] Tokens and sensitive object contents were excluded from logs.
- [ ] A human reviewed the policy, exploitability, and proposed fix.

> An AI-generated security finding is a hypothesis until the code path, attack conditions, and remediation test have been verified.

## A practical authorization review checklist

Use this checklist when reviewing a new API endpoint or an existing multi-tenant flow.

### Identity and token validation

- Is the token signature validated with trusted configuration?
- Are issuer, audience, and lifetime verified?
- Are delegated-user and app-only tokens intentionally distinguished?
- Are stable, non-reassignable identifiers used for security decisions?
- Is the external identity mapped to an active application membership?
- Is the active application tenant explicit rather than inferred from an object ID?

### Resource authorization

- What exact action is the caller attempting?
- What exact resource is affected?
- Which tenant owns that resource?
- Which role, permission, assignment, or relationship allows the action?
- Is separation of duties required?
- Does the policy deny when required context is missing?
- Is authorization repeated for every object in bulk operations?

### Data access

- Does the repository scope reads and writes by tenant?
- Are unsafe unscoped lookup methods difficult to call?
- Does authorization happen before sensitive data is serialized, cached, or logged?
- Are update and delete predicates tenant-scoped?
- Are concurrency controls included in sensitive mutations?
- If PostgreSQL RLS is used, is connection-pool behavior tested?

### Frontend and caching

- Are hidden controls treated as UX rather than enforcement?
- Do cache keys include tenant context?
- Are tenant-specific caches cleared on context changes?
- Can stale drawers, tabs, or background requests act on the previous tenant?
- Do error states avoid confirming unauthorized object existence?

### Verification and operations

- Is there at least one cross-tenant negative test?
- Are role and relationship combinations tested separately?
- Are authorization denials observable with safe reason codes?
- Are raw tokens and sensitive object contents excluded from logs?
- Can responders connect a decision to a request without exposing private data?
- Does a finding improve shared templates, review guidance, and existing services?

## What I would ask in the architecture review

When a diagram says “authenticated API,” I now want to know what happens after authentication.

Show me one request. Name the caller, action, tenant, and object. Show where the token becomes an internal principal. Show where membership is resolved. Show the policy decision. Show the scoped query. Show the negative test. Show the telemetry produced when the answer is no.

If we cannot follow that path, the architecture does not yet explain its security boundary.

This approach is intentionally practical. It does not require a new authorization product before the team can improve. Start with one high-value resource, one tenant invariant, and one test that attempts to cross the boundary. Then make the safe implementation reusable.

The lesson from invoice `842` is not merely “remember to add a tenant filter.” The deeper lesson is that authentication can be perfectly implemented while authorization remains structurally absent.

The API knew who Alice was.

It also needed to know what she was allowed to touch.

## Further reading

- [OWASP API1:2023 — Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- [OWASP API5:2023 — Broken Function Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [Microsoft identity platform — Secure applications and APIs by validating claims](https://learn.microsoft.com/en-us/entra/identity-platform/claims-validation)
- [Microsoft Entra ID — Authorize applications, resources, and workloads](https://learn.microsoft.com/en-us/entra/architecture/authorize-applications-resources-workloads)
- [NIST SP 800-207 — Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final)
