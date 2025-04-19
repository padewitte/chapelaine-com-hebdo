export class BaseUI {
    static removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    static createHtmlElement(type, className, innerHtml) {
        const newDiv = document.createElement(type);
        newDiv.className = className + " hbgenerated";
        newDiv.innerHTML = innerHtml;
        return newDiv;
    }

    static minimizeUploadAndShowDataSelector() {
        if(document.querySelector('#upload-alert').hide){
            document.querySelector('#upload-alert').hide();
            const dataSelector = document.querySelector('#dataSelector');
            dataSelector.style.display = 'block';
        }
    }

} 