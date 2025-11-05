document.addEventListener('DOMContentLoaded', function() {
    // Data Antrian untuk Timeline (Mirip Gambar 2)
    const antrianData = [
        {
            date: "26 Nov '19",
            time: "09:00 - 10:00",
            treatment: "Open Access",
            dentist: "DR. Conan",
            nurse: "Dr. Vanilla",
            status: "past" // 'past' atau 'upcoming'
        },
        {
            date: "12 Dec '19",
            time: "09:00 - 10:00",
            treatment: "Root Canal prep",
            dentist: "DR. Conan",
            nurse: "Jessica",
            status: "upcoming"
        },
         {
            date: "20 Dec '19",
            time: "10:00 - 11:00",
            treatment: "Scaling",
            dentist: "DR. Who",
            nurse: "Rose",
            status: "upcoming"
        }
    ];

    const timelineContainer = document.getElementById('timelineAntrian');

    antrianData.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('timeline-item');
        if (item.status === 'past') {
            itemDiv.classList.add('past');
        }

        itemDiv.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="fw-bold">${item.date}</div>
                    <button class="btn btn-sm btn-primary">Note</button>
                </div>
                <small class="text-muted">${item.time}</small>
                <div class="mt-2 row">
                    <div class="col-12">
                        <span class="badge bg-secondary">${item.treatment}</span>
                    </div>
                    <div class="col-4 mt-2">
                        <small class="fw-bold d-block">Dentist</small>
                        <span>${item.dentist}</span>
                    </div>
                    <div class="col-4 mt-2">
                        <small class="fw-bold d-block">Nurse</small>
                        <span>${item.nurse}</span>
                    </div>
                </div>
            </div>
        `;
        timelineContainer.appendChild(itemDiv);
    });

    // Logika untuk toggle sidebar (mirip Gambar 1)
    const sidebarToggle = document.getElementById('sidebarToggle');
    const wrapper = document.getElementById('wrapper');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();
            wrapper.classList.toggle('toggled');
        });
    }

});