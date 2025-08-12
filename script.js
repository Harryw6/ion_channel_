class IonChannelViewer {
    constructor() {
        this.data = [];
        this.pdbFiles = [];
        this.currentViewer = null;
        this.currentStyle = 'cartoon';
        this.init();
    }

    // 简单的CSV解析函数
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            result.push(row);
        }
        
        return result;
    }

    init() {
        this.loadData();
        this.loadPDBFiles();
        this.setupEventListeners();
        // 延迟渲染表格，确保数据加载完成
        setTimeout(() => {
            this.renderTable();
        }, 100);
    }

    loadData() {
        // 直接嵌入CSV数据
        const csvData = `Channel,design,n,mpnn,plddt,i_ptm,i_pae,rmsd,seq
Nav1.2,0,0,1.670964132,0.264105022,0.10404928,25.90797788,28.1592617,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLIVKLLAEK
Nav1.2,0,1,1.716530679,0.305697739,0.180560946,23.28447151,31.25585365,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLEVLKLAKK
Nav1.2,1,0,1.619780026,0.279690266,0.135494381,25.08698273,24.42000198,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLLFLLVKKL
Nav1.2,1,1,1.61258087,0.279690266,0.135494381,25.08698273,24.42000198,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLLFLLVKKL
Nav1.2,2,0,1.311588447,0.220756114,0.121419363,24.86878633,26.43888092,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/DYYLPVLALI
Nav1.2,2,1,1.35445842,0.568643898,0.531189084,14.48365211,5.720145226,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/DYYLPEILKI
BK,3,0,1.526939876,0.292473793,0.115163632,25.07905775,26.69474792,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLFEILKLLG
BK,3,1,1.574088685,0.312396586,0.111420222,25.31439567,33.38283157,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/SLWELLKKLG
BK,4,0,1.466576026,0.302256465,0.13748911,25.06625843,29.09628677,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LVILLILILM
BK,4,1,1.487688349,0.30949384,0.21154502,21.88833278,18.87038803,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LVVFLILLLM
BK,5,0,1.392094557,0.284580708,0.157770783,24.48585063,3.397523403,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/SLALEIVEKE
KCNQ,5,1,1.45593213,0.247543395,0.126129374,24.66247094,8.533480644,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/ALALELVAKE
KCNQ,6,0,1.645189093,0.304338515,0.150696963,24.34013015,29.90740204,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LISKLILKLL
KCNQ,6,1,1.605413864,0.309301257,0.149298012,24.26525956,22.95729637,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/LLFLIILKLL
KCNQ,7,0,1.560803638,0.31350708,0.168339461,23.56371921,30.58870125,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/YSLYMIIKEL
KCNQ,7,1,1.33681414,0.553117067,0.479515672,16.27376497,32.23592377,ALIQSVKKLSDVMILTVFCLSFLGSFYLINLILAVVAMAYEEQNQATMTEEQKKYYNAMKKLGSKKPQKPIPRPANFTIGWNIFDFVVVILSIVGMFLAELIEKYFVSPTLFRVIRLARIGRILRLIKGAKGIRTLLFALMMSLPALFNIGLLLFLVMFIYAIFGMSIIISFLVVVNMYIAVILENFSVATEE/KSLYEIIKEL`;
        
        this.data = this.parseCSV(csvData).filter(row => row.Channel && row.Channel.trim() !== '');
        console.log('加载的数据:', this.data); // 调试信息
    }

    loadPDBFiles() {
        // 直接嵌入PDB文件列表
        this.pdbFiles = [
            'design0_n0.pdb', 'design0_n1.pdb', 'design1_n0.pdb', 'design1_n1.pdb',
            'design2_n0.pdb', 'design2_n1.pdb', 'design3_n0.pdb', 'design3_n1.pdb',
            'design4_n0.pdb', 'design4_n1.pdb', 'design5_n0.pdb', 'design5_n1.pdb',
            'design6_n0.pdb', 'design6_n1.pdb', 'design7_n0.pdb', 'design7_n1.pdb'
        ];
        this.populatePDBSelect();
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

    
    loadPDB(filename) {
        // 加载实际的PDB文件
        const filePath = `all_pdb/${filename}`;
        
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load PDB file: ${response.status}`);
                }
                return response.text();
            })
            .then(pdbText => {
                this.displayPDB(pdbText, filename);
                document.getElementById('pdbSelect').value = filename;
                
                const rowData = this.data.find(row => 
                    `design${row.design}_n${row.n}.pdb` === filename
                );
                
                if (rowData) {
                    this.displayPDBInfo(rowData, filename);
                }
            })
            .catch(error => {
                console.error('Error loading PDB file:', error);
                alert(`无法加载PDB文件: ${filename}\n请确保文件存在于all_pdb目录中`);
            });
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
