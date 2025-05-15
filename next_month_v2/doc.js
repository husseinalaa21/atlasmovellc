document.addEventListener('DOMContentLoaded', function () {
    // Element References
    const elements = {
        // Signature
        canvas: document.getElementById('signatureCanvas'),
        clearSignature: document.getElementById('clearSignature'),
        signaturePad: document.getElementById('signature-pad'),

        // Driver Info
        fullName: document.getElementById('fullName'),
        dob: document.getElementById('dob'),
        address: document.getElementById('address'),
        licenseNumber: document.getElementById('licenseNumber'),
        issueDate: document.getElementById('issueDate'),
        expiryDate: document.getElementById('expiryDate'),
        licenseClass: document.getElementById('licenseClass'),
        ssn: document.getElementById('ssn'),
        accidentYes: document.getElementById('accidentYes'),
        accidentNo: document.getElementById('accidentNo'),
        violationYes: document.getElementById('violationYes'),
        violationNo: document.getElementById('violationNo'),

        // Car Info
        carMake: document.getElementById('carMake'),
        carModel: document.getElementById('carModel'),
        carYear: document.getElementById('carYear'),
        carLicensePlate: document.getElementById('carLicensePlate'),

        // Terms Section
        signatoryName: document.getElementById('signatoryName'),
        agreementDate: document.getElementById('agreementDate'),
        termsAgreement: document.getElementById('termsAgreement'),

        // Submission
        submitBtn: document.getElementById('submitApplication')
    };

    // Canvas Setup
    if (!elements.canvas) {
        console.error('Signature canvas not found!');
        return;
    }

    const ctx = elements.canvas.getContext('2d');
    let isDrawing = false;

    function resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        elements.canvas.width = elements.canvas.offsetWidth * ratio;
        elements.canvas.height = elements.canvas.offsetHeight * ratio;
        ctx.scale(ratio, ratio);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function getCanvasCoordinates(e) {
        const rect = elements.canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
        const scaleX = elements.canvas.width / rect.width;
        const scaleY = elements.canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    elements.canvas.addEventListener('mousedown', e => {
        isDrawing = true;
        const { x, y } = getCanvasCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    });

    elements.canvas.addEventListener('mousemove', e => {
        if (!isDrawing) return;
        const { x, y } = getCanvasCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    });

    elements.canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        isDrawing = true;
        const { x, y } = getCanvasCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    });

    elements.canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!isDrawing) return;
        const { x, y } = getCanvasCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    });

    elements.canvas.addEventListener('mouseup', () => isDrawing = false);
    elements.canvas.addEventListener('mouseleave', () => isDrawing = false);

    elements.clearSignature?.addEventListener('click', () => {
        ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    });

    function isSignatureEmpty() {
        const blank = document.createElement('canvas');
        blank.width = elements.canvas.width;
        blank.height = elements.canvas.height;
        return elements.canvas.toDataURL() === blank.toDataURL();
    }

    function validateForm() {
        let isValid = true;

        const driverFields = [
            elements.fullName,
            elements.dob,
            elements.address,
            elements.licenseNumber,
            elements.issueDate,
            elements.expiryDate,
            elements.licenseClass,
            elements.ssn,
            elements.carMake,
            elements.carModel,
            elements.carYear,
            elements.carLicensePlate
        ];

        driverFields.forEach(field => {
            if (!field.value.trim()) {
                field.closest('.input-group').classList.add('invalid');
                isValid = false;
            } else {
                field.closest('.input-group').classList.remove('invalid');
            }
        });

        const radioGroups = {
            accidents: [elements.accidentYes, elements.accidentNo],
            violations: [elements.violationYes, elements.violationNo]
        };

        Object.values(radioGroups).forEach(group => {
            const isChecked = group.some(radio => radio.checked);
            const groupContainer = group[0].closest('.radio-group');
            if (!isChecked) {
                groupContainer.classList.add('invalid');
                isValid = false;
            } else {
                groupContainer.classList.remove('invalid');
            }
        });

        if (isSignatureEmpty()) {
            elements.signaturePad.classList.add('invalid');
            isValid = false;
        } else {
            elements.signaturePad.classList.remove('invalid');
        }

        return isValid;
    }

    const error_ms = document.getElementById("error_ms");

    if (elements.submitBtn) {
        let isSubmitting = false; // Prevent multiple submissions
        elements.submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            if (!validateForm() || isSubmitting) return;  // Don't proceed if already submitting

            isSubmitting = true; // Mark as submitting

            try {
                elements.submitBtn.disabled = true;
                elements.submitBtn.textContent = 'Sending...';

                const formData = new FormData();

                const fields = [
                    'fullName', 'dob', 'address', 'licenseNumber',
                    'issueDate', 'expiryDate', 'licenseClass', 'ssn',
                    'signatoryName', 'agreementDate',
                    'carMake', 'carModel', 'carYear', 'carLicensePlate'
                ];

                fields.forEach(field => {
                    if (elements[field]) {
                        formData.append(field, elements[field].value);
                    }
                });

                formData.append('accidents', elements.accidentYes.checked ? 'Yes' : 'No');
                formData.append('violations', elements.violationYes.checked ? 'Yes' : 'No');

                const response = await fetch('http://localhost:5000/upload-agreement', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                error_ms.innerHTML = `Submission success!`;
            } catch (error) {
                error_ms.innerHTML = `Submission failed: ${error.message}`;
                console.error(error);
            } finally {
                elements.submitBtn.disabled = false;
                elements.submitBtn.textContent = 'Submit Application';
                isSubmitting = false; // Reset submitting status
            }
        });
    }
});
