        let tasks = [''];
        let generatedReport = '';
        let reports = [];

        // Load reports from localStorage
        function loadReports() {
            const stored = localStorage.getItem('dailyReports');
            if (stored) {
                reports = JSON.parse(stored);
            }
        }

        // Save reports to localStorage
        function saveReports() {
            localStorage.setItem('dailyReports', JSON.stringify(reports));
        }

        // Render tasks
        function renderTasks() {
            const tasksList = document.getElementById('tasksList');
            tasksList.innerHTML = tasks.map((task, index) => `
                <div class="task-item">
                    <input type="text" value="${task}" placeholder="Task ${index + 1}" data-index="${index}">
                    ${tasks.length > 1 ? `
                        <button class="btn btn-danger" onclick="removeTask(${index})">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            `).join('');

            // Add event listeners
            document.querySelectorAll('#tasksList input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    tasks[index] = e.target.value;
                });
            });
        }

        // Add task
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            tasks.push('');
            renderTasks();
        });

        // Remove task
        function removeTask(index) {
            tasks = tasks.filter((_, i) => i !== index);
            renderTasks();
        }

        // Generate report
        document.getElementById('generateBtn').addEventListener('click', () => {
            const reportTitle = document.getElementById('reportTitle').value.trim();
            
            if (!reportTitle) {
                alert('Please enter a report title');
                return;
            }

            const validTasks = tasks.filter(t => t.trim());
            if (validTasks.length === 0) {
                alert('Please add at least one task');
                return;
            }

            const today = new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            let report = `DAILY TASK REPORT\n`;
            report += `${'='.repeat(60)}\n\n`;
            report += `Date: ${today}\n`;
            report += `Report Title: ${reportTitle}\n\n`;
            report += `${'='.repeat(60)}\n\n`;
            report += `TASKS COMPLETED:\n\n`;

            validTasks.forEach((task, index) => {
                report += `${index + 1}. ${task}\n\n`;
            });

            report += `${'='.repeat(60)}\n\n`;
            report += `SUMMARY:\n`;
            report += `Total tasks completed: ${validTasks.length}\n`;
            report += `Report generated on: ${new Date().toLocaleString()}\n`;

            generatedReport = report;
            document.getElementById('reportPreview').innerHTML = `<div class="report-preview">${report}</div>`;
            document.getElementById('reportActions').style.display = 'flex';
            document.getElementById('newReportBtn').style.display = 'block';

            // Save to history
            const newReport = {
                id: Date.now(),
                title: reportTitle,
                date: today,
                timestamp: new Date().toISOString(),
                tasks: validTasks,
                content: report
            };

            reports.unshift(newReport);
            saveReports();
        });

        // Copy to clipboard
        document.getElementById('copyBtn').addEventListener('click', () => {
            navigator.clipboard.writeText(generatedReport);
            alert('Report copied to clipboard!');
        });

        // Download as PDF
        document.getElementById('downloadPdfBtn').addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const lines = generatedReport.split('\n');
            let y = 20;
            
            doc.setFont('courier');
            doc.setFontSize(10);
            
            lines.forEach(line => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 10, y);
                y += 6;
            });
            
            doc.save(`Daily_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        });

        // New report
        document.getElementById('newReportBtn').addEventListener('click', () => {
            tasks = [''];
            document.getElementById('reportTitle').value = '';
            generatedReport = '';
            document.getElementById('reportPreview').innerHTML = `
                <div class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p>Your generated report will appear here</p>
                </div>
            `;
            document.getElementById('reportActions').style.display = 'none';
            document.getElementById('newReportBtn').style.display = 'none';
            renderTasks();
        });

        // Show history
        document.getElementById('historyBtn').addEventListener('click', () => {
            document.getElementById('mainView').style.display = 'none';
            document.getElementById('historyView').classList.add('active');
            renderHistory();
        });

        // Back to generator
        document.getElementById('backBtn').addEventListener('click', () => {
            document.getElementById('mainView').style.display = 'block';
            document.getElementById('historyView').classList.remove('active');
        });

        // Render history
        function renderHistory() {
            const historyList = document.getElementById('historyList');
            
            if (reports.length === 0) {
                historyList.innerHTML = '<div class="empty-state"><p>No reports yet. Create your first report!</p></div>';
                return;
            }

            historyList.innerHTML = reports.map(report => `
                <div class="history-item">
                    <div class="history-item-header">
                        <div>
                            <h3>${report.title}</h3>
                            <div class="history-item-meta">
                                <div>${report.date}</div>
                                <div>${report.tasks.length} tasks</div>
                            </div>
                        </div>
                        <div class="history-actions">
                            <button class="btn btn-secondary btn-small" onclick="viewReport(${report.id})">View</button>
                            <button class="btn btn-danger btn-small" onclick="deleteReport(${report.id})">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // View report
        function viewReport(id) {
            const report = reports.find(r => r.id === id);
            if (report) {
                generatedReport = report.content;
                document.getElementById('reportPreview').innerHTML = `<div class="report-preview">${report.content}</div>`;
                document.getElementById('reportActions').style.display = 'flex';
                document.getElementById('mainView').style.display = 'block';
                document.getElementById('historyView').classList.remove('active');
            }
        }

        // Delete report
        function deleteReport(id) {
            if (confirm('Delete this report?')) {
                reports = reports.filter(r => r.id !== id);
                saveReports();
                renderHistory();
            }
        }

        // Initialize
        loadReports();
        renderTasks();