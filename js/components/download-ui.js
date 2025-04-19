import { BaseUI } from './base-ui.js';

export class DownloadUI extends BaseUI {
    static downloadDivAsImage(divId, fileName) {
        const element = document.getElementById(divId);
        html2canvas(element).then(function (canvas) {
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', canvas.toDataURL("image/png"));
            downloadLink.setAttribute('download', fileName + '.png');
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        });
    }
} 