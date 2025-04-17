export const DomUtils = {
    removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    },

    createElement(type, className, innerHtml) {
        const element = document.createElement(type);
        if (className) {
            element.className = className;
        }
        if (innerHtml) {
            element.innerHTML = innerHtml;
        }
        return element;
    },

    getElement(id) {
        return document.getElementById(id);
    },

    setAttribute(element, name, value) {
        element.setAttribute(name, value);
    },

    removeAttribute(element, name) {
        element.removeAttribute(name);
    },

    addClass(element, className) {
        element.classList.add(className);
    },

    removeClass(element, className) {
        element.classList.remove(className);
    },

    appendChild(parent, child) {
        parent.appendChild(child);
    },

    clearElement(element) {
        element.innerHTML = '';
    }
}; 