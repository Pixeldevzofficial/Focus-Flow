// to make the add subject button work
document.addEventListener('DOMContentLoaded', () => {
    const addSubjectBtn = document.querySelector('.add-subject-btn');
    const subjectContainer = document.querySelector('.subject-input-container');
    let subjectCount = 3;

    addSubjectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        subjectCount++;
        
        const newSubjectInput = document.createElement('label');
        newSubjectInput.setAttribute('for', 'subject-input');
        newSubjectInput.textContent = `Subject ${subjectCount}:`;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'subject-input';
        
        subjectContainer.appendChild(newSubjectInput);
        subjectContainer.appendChild(input);
    });
});

// to make the generate plan button work
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.querySelector('.generate-timetable-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
            const subjectInputs = Array.from(document.querySelectorAll('.subject-input'));
            const filledSubjects = subjectInputs.filter(input => input.value.trim() !== '');
            
            if (filledSubjects.length === 0) {
                e.preventDefault();
                alert('Please fill in at least one subject');
                return;
            }

            const subjects = filledSubjects.map(input => input.value.trim());
            const hoursString = document.querySelector('#myList').value;
            const hours = parseInt(hoursString);
            
            localStorage.setItem('subjects', JSON.stringify(subjects));
            localStorage.setItem('hours', hours.toString());
        });
    }

    const studyTimetable = document.querySelector('.study-timetable');
    if (studyTimetable) {
        const subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
        const totalHours = parseInt(localStorage.getItem('hours')) || 0;
        
        const breakTimeMinutes = 15;
        const totalBreakTime = (subjects.length - 1) * breakTimeMinutes / 60;
        const actualStudyHours = totalHours - totalBreakTime;
        const hoursPerSubject = actualStudyHours / subjects.length;
        
        let currentTime = 9 * 60;
        let tableRows = '';
        
        subjects.forEach((subject, index) => {
            const subjectMinutes = Math.floor(hoursPerSubject * 60);
            const startHour = Math.floor(currentTime / 60);
            const startMin = currentTime % 60;
            currentTime += subjectMinutes;
            const endHour = Math.floor(currentTime / 60);
            const endMin = currentTime % 60;
            
            tableRows += `
                <tr>
                    <td>${formatTime(startHour, startMin)} - ${formatTime(endHour, endMin)}</td>
                    <td>${subject}</td>
                </tr>
            `;

            if (index < subjects.length - 1) {
                const breakStartHour = Math.floor(currentTime / 60);
                const breakStartMin = currentTime % 60;
                currentTime += breakTimeMinutes;
                const breakEndHour = Math.floor(currentTime / 60);
                const breakEndMin = currentTime % 60;
                
                tableRows += `
                    <tr class="break-row">
                        <td>${formatTime(breakStartHour, breakStartMin)} - ${formatTime(breakEndHour, breakEndMin)}</td>
                        <td>Break ☕</td>
                    </tr>
                `;
            }
        });

        function formatTime(hours, minutes) {
            const period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
        
        studyTimetable.innerHTML = `
            <h3>Your Daily Study Schedule</h3>
            <div class="timetable-content">
                <table class="study-table">
                    <thead>
                        <tr>
                            <th>Time Slot</th>
                            <th>Subject</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <p class="total-hours">Total study hours: ${totalHours}</p>
                <div style="text-align: center; margin-top: 30px;">
                    <button id="downloadBtn" class="btn download-btn" style="font-size: 1em; padding: 20px 40px;" onclick="downloadPDF()">Download Timetable</button>
                </div>
            </div>
        `;

        
        
    const downloadBtn = document.getElementById("downloadBtn");

    downloadBtn.addEventListener("click", () => {
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = "Downloaded";
        downloadBtn.classList.add("success");

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        setTimeout(() => {
            downloadBtn.textContent = originalText;
            downloadBtn.classList.remove("success");
        }, 2000);
});


        
        
        // to make the download button work
        window.downloadPDF = function() {
            if (typeof window.jspdf === 'undefined') {
                alert('PDF generation library is not loaded. Please try again.');
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.setTextColor(51, 51, 51);
            doc.text('Your Daily Study Schedule', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(85, 85, 85);
            doc.text(`Total study hours: ${totalHours}`, 105, 30, { align: 'center' });
            
            doc.setFillColor(237, 242, 255);
            doc.rect(20, 40, 170, 10, 'F');
            doc.setTextColor(51, 51, 51);
            doc.text('Time Slot', 30, 46);
            doc.text('Subject', 120, 46);
            
            let yPosition = 55;
            
            subjects.forEach((subject, index) => {
                const subjectMinutes = Math.floor(hoursPerSubject * 60);
                const startHour = Math.floor((9 * 60 + index * (subjectMinutes + breakTimeMinutes)) / 60);
                const startMin = (9 * 60 + index * (subjectMinutes + breakTimeMinutes)) % 60;
                const endHour = Math.floor((9 * 60 + index * (subjectMinutes + breakTimeMinutes) + subjectMinutes) / 60);
                const endMin = (9 * 60 + index * (subjectMinutes + breakTimeMinutes) + subjectMinutes) % 60;
                
                doc.setFillColor(255, 255, 255);
                doc.rect(20, yPosition - 5, 170, 10, 'F');
                doc.setDrawColor(221, 221, 221);
                doc.line(20, yPosition + 5, 190, yPosition + 5);
                doc.setTextColor(51, 51, 51);
                doc.text(`${formatTime(startHour, startMin)} - ${formatTime(endHour, endMin)}`, 30, yPosition);
                doc.text(subject, 120, yPosition);
                yPosition += 15;
                
                if (index < subjects.length - 1) {
                    const breakStartHour = Math.floor((9 * 60 + index * (subjectMinutes + breakTimeMinutes) + subjectMinutes) / 60);
                    const breakStartMin = (9 * 60 + index * (subjectMinutes + breakTimeMinutes) + subjectMinutes) % 60;
                    const breakEndHour = Math.floor((9 * 60 + (index + 1) * (subjectMinutes + breakTimeMinutes)) / 60);
                    const breakEndMin = (9 * 60 + (index + 1) * (subjectMinutes + breakTimeMinutes)) % 60;
                    
                    doc.setFillColor(252, 252, 252);
                    doc.rect(20, yPosition - 5, 170, 10, 'F');
                    doc.setDrawColor(221, 221, 221);
                    doc.line(20, yPosition + 5, 190, yPosition + 5);
                    doc.setTextColor(119, 119, 119);
                    doc.text(`${formatTime(breakStartHour, breakStartMin)} - ${formatTime(breakEndHour, breakEndMin)}`, 30, yPosition);
                    doc.text('Break ☕', 120, yPosition);
                    yPosition += 15;
                }
            });
            
            doc.save('study-timetable.pdf');
        };
    }
});

