declare module '*.css';
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module 'jspdf/dist/jspdf.es.min.js' {
  export { jsPDF } from 'jspdf';
}
