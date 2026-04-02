
const genererRef = (role) => {
            let prefix;
            switch (role) {
                case 'admin':
                    prefix = 'ADM';
                    break;
                case 'rh':
                    prefix = 'RH';
                    break;
                case 'enseignant':
                    prefix = 'ENS';
                    break;  
            }
            const d = new Date();
            const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
            const num = 1; 
            return `${prefix}-${dateStr}-${String(num).padStart(4,'0')}`;
        };

module.exports = genererRef
