class IonChannelViewer {
    constructor() {
        this.data = [];
        this.pdbFiles = [];
        this.currentViewer = null;
        this.currentStyle = 'cartoon';
        this.init();
    }

    async init() {
        await this.loadData();
        await this.loadPDBFiles();
        this.setupEventListeners();
        this.renderTable();
        this.populateFilters();
    }

    async loadData() {
        try {
            const response = await fetch('mpnn_results.csv');
            const csvText = await response.text();
            
            Papa.parse(csvText, {
                header: true,
                complete: (results) => {
                    this.data = results.data.filter(row => row.Channel && row.Channel.trim() !== '');
                },
                error: (error) => {
                    console.error('CSV解析错误:', error);
                }
            });
        } catch (error) {
            console.error('加载CSV文件错误:', error);
        }
    }

    async loadPDBFiles() {
        try {
            const response = await fetch('all_pdb/');
            if (!response.ok) {
                throw new Error('无法加载PDB文件列表');
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a[href$=".pdb"]');
            
            this.pdbFiles = Array.from(links).map(link => link.getAttribute('href'));
            this.populatePDBSelect();
        } catch (error) {
            console.log('使用本地PDB文件列表');
            this.pdbFiles = [
                'design0_n0.pdb', 'design0_n1.pdb', 'design1_n0.pdb', 'design1_n1.pdb',
                'design2_n0.pdb', 'design2_n1.pdb', 'design3_n0.pdb', 'design3_n1.pdb',
                'design4_n0.pdb', 'design4_n1.pdb', 'design5_n0.pdb', 'design5_n1.pdb',
                'design6_n0.pdb', 'design6_n1.pdb', 'design7_n0.pdb', 'design7_n1.pdb'
            ];
            this.populatePDBSelect();
        }
    }

    populatePDBSelect() {
        const select = document.getElementById('pdbSelect');
        select.innerHTML = '<option value="">选择PDB文件</option>';
        
        this.pdbFiles.forEach(file => {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterTable(e.target.value);
        });

        document.getElementById('channelFilter').addEventListener('change', (e) => {
            this.filterByChannel(e.target.value);
        });

        document.getElementById('pdbSelect').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadPDB(e.target.value);
            }
        });

        document.getElementById('resetView').addEventListener('click', () => {
            if (this.currentViewer) {
                this.currentViewer.zoomTo();
                this.currentViewer.render();
            }
        });

        document.getElementById('toggleStyle').addEventListener('click', () => {
            this.toggleDisplayStyle();
        });
    }

    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        this.data.forEach(row => {
            const tr = document.createElement('tr');
            
            const pdbFile = `design${row.design}_n${row.n}.pdb`;
            const hasPDB = this.pdbFiles.includes(pdbFile);
            
            tr.innerHTML = `
                <td>${row.Channel}</td>
                <td>${row.design}</td>
                <td>${row.n}</td>
                <td class="${this.getScoreClass(parseFloat(row.mpnn), 1.5, 1.3)}">${row.mpnn}</td>
                <td class="${this.getScoreClass(parseFloat(row.plddt), 0.7, 0.5)}">${row.plddt}</td>
                <td class="${this.getScoreClass(parseFloat(row.i_ptm), 0.5, 0.3)}">${row.i_ptm}</td>
                <td class="${this.getScoreClass(parseFloat(row.i_pae), 0.3, 0.2)}">${row.i_pae}</td>
                <td class="${this.getScoreClass(parseFloat(row.rmsd), 20, 30, true)}">${row.rmsd}</td>
                <td>
                    ${hasPDB ? `<button class="view-btn" onclick="viewer.loadPDB('${pdbFile}')">查看结构</button>` : '无PDB'}
                </td>
            `;
            
            tbody.appendChild(tr);
        });
    }

    getScoreClass(value, goodThreshold, mediumThreshold, reverse = false) {
        if (reverse) {
            if (value <= goodThreshold) return 'score-good';
            if (value <= mediumThreshold) return 'score-medium';
            return 'score-poor';
        } else {
            if (value >= goodThreshold) return 'score-good';
            if (value >= mediumThreshold) return 'score-medium';
            return 'score-poor';
        }
    }

    populateFilters() {
        const channels = [...new Set(this.data.map(row => row.Channel))];
        const select = document.getElementById('channelFilter');
        
        channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel;
            option.textContent = channel;
            select.appendChild(option);
        });
    }

    filterTable(searchTerm) {
        const rows = document.querySelectorAll('#tableBody tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    filterByChannel(channel) {
        const rows = document.querySelectorAll('#tableBody tr');
        
        rows.forEach(row => {
            const channelCell = row.cells[0].textContent;
            row.style.display = !channel || channelCell === channel ? '' : 'none';
        });
    }

    async loadPDB(filename) {
        try {
            const response = await fetch(`all_pdb/${filename}`);
            if (!response.ok) {
                throw new Error('无法加载PDB文件');
            }
            
            const pdbText = await response.text();
            this.displayPDB(pdbText, filename);
            
            document.getElementById('pdbSelect').value = filename;
            
            const rowData = this.data.find(row => 
                `design${row.design}_n${row.n}.pdb` === filename
            );
            
            if (rowData) {
                this.displayPDBInfo(rowData, filename);
            }
            
        } catch (error) {
            console.error('加载PDB文件错误:', error);
            document.getElementById('pdbInfo').innerHTML = `<p style="color: red;">错误: ${error.message}</p>`;
        }
    }

    displayPDB(pdbText, filename) {
        const viewerElement = document.getElementById('pdbViewer');
        
        if (this.currentViewer) {
            this.currentViewer.clear();
        }
        
        this.currentViewer = $3Dmol.createViewer(viewerElement, {
            backgroundColor: 'white',
            antialias: true
        });
        
        this.currentViewer.addModel(pdbText, 'pdb');
        this.currentViewer.setStyle({}, { cartoon: { colorscheme: 'ssPyMOL' } });
        this.currentViewer.zoomTo();
        this.currentViewer.render();
        
        this.currentStyle = 'cartoon';
    }

    displayPDBInfo(rowData, filename) {
        const info = document.getElementById('pdbInfo');
        info.innerHTML = `
            <h3>文件信息: ${filename}</h3>
            <p><strong>通道名称:</strong> ${rowData.Channel}</p>
            <p><strong>设计编号:</strong> ${rowData.design}</p>
            <p><strong>变体:</strong> ${rowData.n}</p>
            <p><strong>MPNN分数:</strong> ${rowData.mpnn}</p>
            <p><strong>pLDDT:</strong> ${rowData.plddt}</p>
            <p><strong>ipTM:</strong> ${rowData.i_ptm}</p>
            <p><strong>ipAE:</strong> ${rowData.i_pae}</p>
            <p><strong>RMSD:</strong> ${rowData.rmsd}</p>
            <p><strong>序列:</strong> ${rowData.seq}</p>
        `;
    }

    toggleDisplayStyle() {
        if (!this.currentViewer) return;
        
        const styles = ['cartoon', 'stick', 'sphere', 'line'];
        const currentIndex = styles.indexOf(this.currentStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        this.currentStyle = styles[nextIndex];
        
        let styleConfig;
        switch (this.currentStyle) {
            case 'cartoon':
                styleConfig = { cartoon: { colorscheme: 'ssPyMOL' } };
                break;
            case 'stick':
                styleConfig = { stick: { colorscheme: 'greenCarbon' } };
                break;
            case 'sphere':
                styleConfig = { sphere: { colorscheme: 'greenCarbon' } };
                break;
            case 'line':
                styleConfig = { line: { colorscheme: 'greenCarbon' } };
                break;
        }
        
        this.currentViewer.setStyle({}, styleConfig);
        this.currentViewer.render();
    }
}

const viewer = new IonChannelViewer();

document.addEventListener('DOMContentLoaded', () => {
    console.log('离子通道数据查看器已加载');
});