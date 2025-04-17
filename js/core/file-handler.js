export const FileHandler = {
    parseCSV(content) {
        const csv = d3.dsvFormat(";");
        return csv.parse(content);
    },

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const content = event.target.result;
                const data = this.parseCSV(content);
                const fileType = this.determineFileType(data);
                resolve({ type: fileType, data, fileName: file.name });
            };

            reader.onerror = (event) => {
                reject(new Error(`File could not be read! Code ${event.target.error.code}`));
            };

            reader.readAsText(file);
        });
    },

    determineFileType(data) {
        if (data && data[0] && data[0]['Etat']) {
            return 'resultat';
        }
        return 'programme';
    },

    isValidFileType(file) {
        return file.type === 'text/csv' || file.type === 'text/txt';
    },

    async processFiles(files) {
        const validFiles = Array.from(files).filter(this.isValidFileType);
        const results = await Promise.all(validFiles.map(file => this.readFile(file)));
        return results;
    }
}; 