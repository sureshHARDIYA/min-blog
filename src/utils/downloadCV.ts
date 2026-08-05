export const downloadCV = () => {
  const link = document.createElement('a');
  link.href = '/Suresh_Kumar_Mukhiya_CV.pdf';
  link.download = 'Suresh_Kumar_Mukhiya_CV.pdf';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
