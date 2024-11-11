let steps = [];
let currentStepIndex = 0;
let initialN = parseInt(document.getElementById('n').value);
let initialX = parseInt(document.getElementById('x').value);

function checkForChanges() {
    const n = parseInt(document.getElementById('n').value);
    const x = parseInt(document.getElementById('x').value);
    const visualizeButton = document.getElementById('visualizeButton');

    if (n !== initialN || x !== initialX) {
        visualizeButton.style.display = 'inline-block';
    } else {
        visualizeButton.style.display = 'none';
    }
}

function startVisualization() {
    document.querySelectorAll('.calculation-display').forEach(display => {
        if (display.id !== 'operation-dialog') {
            display.remove();
        }
    });

    const n = parseInt(document.getElementById('n').value);
    const x = parseInt(document.getElementById('x').value);

    if (isNaN(n) || isNaN(x)) {
        alert('Please enter valid values for n and x.');
        return;
    }

    visualizeBitwise(n, x);
    currentStepIndex = 0;
    updateVisualization();

    // Update initial values after visualization starts
    initialN = n;
    initialX = x;
    checkForChanges();
}

function visualizeBitwise(n, x) {
    let result = x;
    let remaining = n - 1;
    let position = 1;
    steps = [];

    steps.push({ result, remaining, position, highlight: -1 });

    while (remaining > 0) {
        let highlight = -1;
        if ((x & position) === 0) {
            if (remaining & 1) {
                result |= position;
                highlight = Math.log2(position);
            }
            remaining >>= 1;
        }
        position <<= 1;
        steps.push({ result, remaining, position, highlight });
    }
}

function updateVisualization(step = 'next') {
    const visualization = document.getElementById('visualization');
    visualization.innerHTML = '';

    if (currentStepIndex < 0 || currentStepIndex >= steps.length) {
        return;
    }

    const { result, remaining, position, highlight } = steps[currentStepIndex];

    const createBitDisplay = (label, value, description, highlightBit) => {
        const container = document.createElement('div');
        container.className = 'bit-display';
        container.setAttribute('data-bs-toggle', 'popover');
        container.setAttribute('data-bs-trigger', 'hover focus');
        container.setAttribute('data-bs-placement', 'right');

        let popoverContent = `${label}: `;
        if (label === 'Result') {
            if (highlight !== -1) {
                popoverContent += `Bit at position ${highlight} set to 1 (result |= ${1 << highlight})`;
            } else {
                popoverContent += 'No change in this step';
            }
        } else if (label === 'Remaining') {
            if (currentStepIndex > 0) {
                popoverContent += 'Remaining shifted right (remaining >> 1)';
            } else {
                popoverContent += 'Initial value, no change yet';
            }
        } else if (label === 'Position') {
            if (currentStepIndex > 0) {
                popoverContent += 'Position shifted left (position <<= 1)';
            } else {
                popoverContent += 'Initial position';
            }
        }
        container.setAttribute('data-bs-content', popoverContent);

        const labelElem = document.createElement('div');
        labelElem.textContent = label;
        const bitsElem = document.createElement('div');
        bitsElem.className = 'bits';
        for (let i = 31; i >= 0; i--) {
            const bit = document.createElement('div');
            bit.className = 'bit';
            if (value & (1 << i)) {
                bit.classList.add('on');
            }
            if (i === highlightBit) {
                bit.classList.add('highlight');
            }
            bit.textContent = (value & (1 << i)) ? '1' : '0';
            bitsElem.appendChild(bit);
        }
        const descriptionElem = document.createElement('div');
        descriptionElem.className = 'description';
        descriptionElem.textContent = description;
        container.appendChild(labelElem);
        container.appendChild(bitsElem);
        container.appendChild(descriptionElem);
        return container;
    };

    const resultDisplay = createBitDisplay('Result', result, 'The current value of result after performing bitwise operations', highlight);
    const remainingDisplay = createBitDisplay('Remaining', remaining, 'The number of iterations left to process', -1);
    const positionDisplay = createBitDisplay('Position', position, 'The current bit position being evaluated (used to modify result)', -1);
    const calculationDisplay = document.createElement('div');
    if (step != 'previous'){
        calculationDisplay.className = 'calculation-display';
        calculationDisplay.innerHTML = `<strong>Calculation Details:</strong><br>
            Result: ${result}<br>
            Remaining: ${remaining}<br>
            Position: ${position}`;
    }

    const bitColumn = document.createElement('div');
    bitColumn.style.display = 'inline-block';
    bitColumn.appendChild(resultDisplay);
    bitColumn.appendChild(remainingDisplay);
    bitColumn.appendChild(positionDisplay);

    visualization.appendChild(bitColumn);
    if (step != 'previous'){
        visualization.parentNode.appendChild(calculationDisplay);
    }

    // Initialize Bootstrap popovers after elements are added
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    popoverTriggerList.forEach((popoverTriggerEl) => {
        new bootstrap.Popover(popoverTriggerEl);
    });

    if (currentStepIndex === steps.length - 1 && step !== 'previous') {
        const finalMessage = document.createElement('div');
        finalMessage.textContent = 'Final result reached!';
        finalMessage.style.color = 'green';
        finalMessage.style.fontWeight = 'bold';
        visualization.appendChild(finalMessage);
    }
}

function nextStep() {
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        updateVisualization();
    }
}

function previousStep() {
    const container = document.getElementById('visualization-container');
    if (container.lastChild) {
        container.lastChild.remove();
    }

    if (currentStepIndex > 0) {
        currentStepIndex--;
        updateVisualization(step = "previous");
    }
}
