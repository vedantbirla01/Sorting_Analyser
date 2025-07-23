// DOM Elements
const arrayContainer = document.getElementById('array-container');
const sortBtn = document.getElementById('sort-btn');
const stopBtn = document.getElementById('stop-btn');
const restartBtn = document.getElementById('restart-btn');
const sortTypeSelect = document.getElementById('sort-type');
const numElementsSlider = document.getElementById('num-elements');
const speedSlider = document.getElementById('speed');
const elementsValue = document.getElementById('elements-value');
const speedValue = document.getElementById('speed-value');
const swapCountDisplay = document.getElementById('swap-count');
const timeCountDisplay = document.getElementById('time-count');
const algorithmInfoDisplay = document.getElementById('algorithm-info');
const operationCountDisplay = document.getElementById('operation-count');

// State variables
let array = [];
let barElements = [];
let isSorting = false;
let swapCount = 0;
let startTime = 0;
let animationId = null;
let operationCount = 0;

// Algorithm descriptions
const algorithmDescriptions = {
    bubble: "Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Time complexity: O(n²).",
    merge: "Merge Sort divides the array into halves, recursively sorts them, and then merges the sorted halves. Time complexity: O(n log n).",
    quick: "Quick Sort picks a 'pivot' element and partitions the array into two sub-arrays around the pivot. Time complexity: O(n log n) average, O(n²) worst case.",
    selection: "Selection Sort divides the array into a sorted and unsorted region, repeatedly selecting the smallest element from the unsorted region. Time complexity: O(n²).",
    insertion: "Insertion Sort builds the final sorted array one item at a time by comparisons. Time complexity: O(n²)."
};

// Initialize the app
function init() {
    generateArray(parseInt(numElementsSlider.value));
    setupEventListeners();
    updateAlgorithmInfo();
}

// Generate random array
function generateArray(numElements) {
    array = [];
    for (let i = 0; i < numElements; i++) {
        array.push(Math.floor(Math.random() * 400) + 20);
    }
    renderArray();
    swapCount = 0;
    swapCountDisplay.textContent = '0';
    timeCountDisplay.textContent = '0ms';
}

// Render array as bars
function renderArray() {
    arrayContainer.innerHTML = '';
    barElements = [];
    
    const containerWidth = arrayContainer.clientWidth;
    const containerHeight = arrayContainer.clientHeight;
    const barWidth = Math.max(2, (containerWidth / array.length) - 2);
    
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.width = `${barWidth}px`;
        bar.style.height = `${array[i]}px`;
        arrayContainer.appendChild(bar);
        barElements.push(bar);
    }
}

// Set up event listeners
function setupEventListeners() {
    sortBtn.addEventListener('click', startSorting);
    stopBtn.addEventListener('click', stopSorting);
    restartBtn.addEventListener('click', restartSorting);
    
    numElementsSlider.addEventListener('input', () => {
        elementsValue.textContent = numElementsSlider.value;
        if (!isSorting) {
            generateArray(parseInt(numElementsSlider.value));
        }
    });
    
    speedSlider.addEventListener('input', () => {
        speedValue.textContent = speedSlider.value;
    });
    
    sortTypeSelect.addEventListener('change', updateAlgorithmInfo);
}

// Update algorithm information display
function updateAlgorithmInfo() {
    const selectedAlgorithm = sortTypeSelect.value;
    algorithmInfoDisplay.textContent = algorithmDescriptions[selectedAlgorithm];
}

// Get current animation delay based on speed setting
function getDelay() {
    const speed = parseInt(speedSlider.value);
    return 1000 / (speed * 2);
}

// Animation delay helper
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Highlight bars being compared
async function highlightComparison(i, j) {
    if (!isSorting) return;
    
    barElements[i].classList.add('comparing');
    barElements[j].classList.add('comparing');
    
    await delay(getDelay());
    
    if (!isSorting) return;
    barElements[i].classList.remove('comparing');
    barElements[j].classList.remove('comparing');
}

// Swap two elements in the array
async function swap(i, j) {
    if (!isSorting) return;
    
    barElements[i].classList.add('swapping');
    barElements[j].classList.add('swapping');
    
    [array[i], array[j]] = [array[j], array[i]];
    barElements[i].style.height = `${array[i]}px`;
    barElements[j].style.height = `${array[j]}px`;
    
    swapCount++;
    swapCountDisplay.textContent = swapCount;
    
    await delay(getDelay());
    
    if (!isSorting) return;
    barElements[i].classList.remove('swapping');
    barElements[j].classList.remove('swapping');
}

// Mark an element as sorted
function markSorted(index) {
    barElements[index].classList.add('sorted');
}

// Mark a range as sorted
function markSortedRange(start, end) {
    for (let i = start; i <= end; i++) {
        barElements[i].classList.add('sorted');
    }
}

// Bubble Sort algorithm
async function bubbleSort() {
    for (let i = 0; i < array.length && isSorting; i++) {
        for (let j = 0; j < array.length - i - 1 && isSorting; j++) {
            await highlightComparison(j, j + 1);
            if (!isSorting) break;
            if (array[j] > array[j + 1]) {
                await swap(j, j + 1);
            }
        }
        if (isSorting) markSorted(array.length - i - 1);
    }
}

// Merge Sort algorithm
async function mergeSort(start = 0, end = array.length - 1) {
    if (!isSorting) return;
    if (start >= end) return;
    
    const mid = Math.floor((start + end) / 2);
    await mergeSort(start, mid);
    if (!isSorting) return;
    await mergeSort(mid + 1, end);
    if (!isSorting) return;
    await merge(start, mid, end);
}

async function merge(start, mid, end) {
    const left = array.slice(start, mid + 1);
    const right = array.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;
    
    while (i < left.length && j < right.length && isSorting) {
        await highlightComparison(start + i, mid + 1 + j);
        if (left[i] <= right[j]) {
            array[k] = left[i];
            barElements[k].style.height = `${left[i]}px`;
            i++;
        } else {
            array[k] = right[j];
            barElements[k].style.height = `${right[j]}px`;
            j++;
            // Count moves from right array as swaps
            operationCount ++;
            operationCountDisplay.textContent = operationCount;
        }
        k++;
        await delay(getDelay());
    }

    while (i < left.length && isSorting) {
        array[k] = left[i];
        barElements[k].style.height = `${left[i]}px`;
        i++;
        k++;
        await delay(getDelay());
    }

    while (j < right.length && isSorting) {
        array[k] = right[j];
        barElements[k].style.height = `${right[j]}px`;
        j++;
        k++;
        await delay(getDelay());
    }

    if (isSorting) markSortedRange(start, end);
}

// Quick Sort algorithm
async function quickSort(low = 0, high = array.length - 1) {
    if (!isSorting) return;
    if (low < high) {
        const pi = await partition(low, high);
        if (!isSorting) return;
        await quickSort(low, pi - 1);
        if (!isSorting) return;
        await quickSort(pi + 1, high);
    }
    if (low === 0 && high === array.length - 1 && isSorting) {
        markSortedRange(0, array.length - 1);
    }
}

async function partition(low, high) {
    if (!isSorting) return -1;
    let pivot = array[high];
    let i = low - 1;
    
    for (let j = low; j < high && isSorting; j++) {
        await highlightComparison(j, high);
        if (array[j] < pivot) {
            i++;
            await swap(i, j);
        }
    }
    
    if (isSorting) {
        await swap(i + 1, high);
        return i + 1;
    }
    return -1;
}

// Selection Sort algorithm
async function selectionSort() {
    for (let i = 0; i < array.length && isSorting; i++) {
        let minIdx = i;
        for (let j = i + 1; j < array.length && isSorting; j++) {
            await highlightComparison(minIdx, j);
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i && isSorting) {
            await swap(i, minIdx);
        }
        if (isSorting) markSorted(i);
    }
}

// Insertion Sort algorithm
async function insertionSort() {
    for (let i = 1; i < array.length && isSorting; i++) {
        let key = array[i];
        let j = i - 1;
        
        while (j >= 0 && array[j] > key && isSorting) {
            await highlightComparison(j, j + 1);
            array[j + 1] = array[j];
            barElements[j + 1].style.height = `${array[j]}px`;
            // Count each shift operation as a swap
            operationCount ++;
            operationCountDisplay.textContent = operationCount;
            j--;
            await delay(getDelay());
        }
        
        array[j + 1] = key;
        barElements[j + 1].style.height = `${key}px`;
        if (isSorting) markSorted(i);
        await delay(getDelay());
    }
}

// Start sorting process
async function startSorting() {
    if (isSorting) return;
    
    operationCount = 0;
    operationCountDisplay.textContent = '0';
    isSorting = true;
    swapCount = 0;
    startTime = performance.now();
    swapCountDisplay.textContent = '0';
    timeCountDisplay.textContent = '0ms';
    
    // Reset all bars to default state
    barElements.forEach(bar => {
        bar.className = 'bar';
    });
    
    const sortType = sortTypeSelect.value;
    
    try {
        if (sortType === 'bubble') await bubbleSort();
        else if (sortType === 'merge') await mergeSort();
        else if (sortType === 'quick') await quickSort();
        else if (sortType === 'selection') await selectionSort();
        else if (sortType === 'insertion') await insertionSort();
    } catch (e) {
        console.log("Sorting stopped");
    }
    
    if (isSorting) {
        const endTime = performance.now();
        timeCountDisplay.textContent = `${Math.round(endTime - startTime)}ms`;
    }
    
    isSorting = false;
}

// Stop sorting process
function stopSorting() {
    isSorting = false;
}

// Restart sorting process
function restartSorting() {
    stopSorting();
    generateArray(parseInt(numElementsSlider.value));
}

// Initialize the application
init();