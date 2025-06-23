// Global variables
let currentPage = 1;
const totalPages = 100;
const itemsPerPage = 9; // 3x3 grid
let currentEditingIndex = null;

// Data storage - In a real application, this would be connected to a backend
let contentData = {};

// DOM elements
const gridContainer = document.getElementById('gridContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const paginationNumbers = document.getElementById('paginationNumbers');
const modal = document.getElementById('modal');
const contentForm = document.getElementById('contentForm');
const closeModal = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeGrid();
    initializePagination();
    initializeEventListeners();
    setCurrentDate();
});

// Initialize the 3x3 grid
function initializeGrid() {
    gridContainer.innerHTML = '';
    
    for (let i = 1; i <= 9; i++) {
        const globalIndex = getGlobalIndex(currentPage, i);
        const gridItem = createGridItem(globalIndex);
        gridContainer.appendChild(gridItem);
    }
}

// Create individual grid item
function createGridItem(index) {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';
    gridItem.dataset.index = index;
    
    const hasContent = contentData[index];
    if (hasContent) {
        gridItem.classList.add('has-content');
    }
    
    gridItem.innerHTML = `
        <div class="grid-item-header">
            <span class="grid-index">Index: ${index}</span>
            <button class="add-content-btn" onclick="openModal(${index})">
                ${hasContent ? 'Edit' : 'Add'}
            </button>
        </div>
        <div class="grid-content">
            ${hasContent ? renderContent(contentData[index]) : '<div class="empty-state">Click "Add" to add content</div>'}
        </div>
    `;
    
    return gridItem;
}

// Render content for a grid item
function renderContent(data) {
    let html = '<div class="video-info">';
    
    if (data.videoName) {
        html += `<div class="video-name">${data.videoName}</div>`;
    }
    
    if (data.videoDescription) {
        html += `<div class="video-description">${data.videoDescription}</div>`;
    }
    
    if (data.uploadDate) {
        html += `<div class="video-meta">Uploaded: ${formatDate(data.uploadDate)}</div>`;
    }
    
    if (data.views !== undefined) {
        html += `<div class="video-views">Views: ${data.views}</div>`;
    }
    
    if (data.videoLink) {
        html += `<a href="${data.videoLink}" class="video-link" target="_blank" onclick="incrementViews(${data.index})">Watch Video</a>`;
    }
    
    html += '</div>';
    
    // Add attachments if any
    if (data.photos && data.photos.length > 0) {
        html += '<div class="attachments">';
        data.photos.forEach(photo => {
            html += `<span class="attachment-item">📷 ${photo.name}</span>`;
        });
        html += '</div>';
    }
    
    if (data.documents && data.documents.length > 0) {
        if (!data.photos || data.photos.length === 0) {
            html += '<div class="attachments">';
        }
        data.documents.forEach(doc => {
            html += `<span class="attachment-item">📄 ${doc.name}</span>`;
        });
        html += '</div>';
    }
    
    return html;
}

// Calculate global index based on page and local position
function getGlobalIndex(page, localIndex) {
    return (page - 1) * itemsPerPage + localIndex;
}

// Initialize pagination
function initializePagination() {
    updatePaginationNumbers();
    updatePaginationButtons();
}

// Update pagination numbers display
function updatePaginationNumbers() {
    paginationNumbers.innerHTML = '';
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.className = 'page-number';
        pageNumber.textContent = i;
        pageNumber.dataset.page = i;
        
        if (i === currentPage) {
            pageNumber.classList.add('active');
        }
        
        pageNumber.addEventListener('click', () => goToPage(i));
        paginationNumbers.appendChild(pageNumber);
    }
}

// Update pagination buttons state
function updatePaginationButtons() {
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Go to specific page
function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        initializeGrid();
        updatePaginationNumbers();
        updatePaginationButtons();
    }
}

// Initialize event listeners
function initializeEventListeners() {
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });
    
    closeModal.addEventListener('click', closeModalHandler);
    cancelBtn.addEventListener('click', closeModalHandler);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalHandler();
        }
    });
    
    contentForm.addEventListener('submit', handleFormSubmit);
}

// Open modal for adding/editing content
function openModal(index) {
    currentEditingIndex = index;
    modal.style.display = 'block';
    
    // Pre-fill form if editing existing content
    if (contentData[index]) {
        const data = contentData[index];
        document.getElementById('videoLink').value = data.videoLink || '';
        document.getElementById('videoName').value = data.videoName || '';
        document.getElementById('videoDescription').value = data.videoDescription || '';
        document.getElementById('uploadDate').value = data.uploadDate || '';
    } else {
        contentForm.reset();
        setCurrentDate();
    }
}

// Close modal
function closeModalHandler() {
    modal.style.display = 'none';
    currentEditingIndex = null;
    contentForm.reset();
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contentForm);
    const photoFiles = document.getElementById('photoUpload').files;
    const documentFiles = document.getElementById('documentUpload').files;
    
    const data = {
        index: currentEditingIndex,
        videoLink: document.getElementById('videoLink').value,
        videoName: document.getElementById('videoName').value,
        videoDescription: document.getElementById('videoDescription').value,
        uploadDate: document.getElementById('uploadDate').value,
        views: contentData[currentEditingIndex] ? contentData[currentEditingIndex].views || 0 : 0,
        photos: [],
        documents: []
    };
    
    // Process uploaded photos
    for (let i = 0; i < photoFiles.length; i++) {
        data.photos.push({
            name: photoFiles[i].name,
            size: photoFiles[i].size,
            type: photoFiles[i].type
        });
    }
    
    // Process uploaded documents
    for (let i = 0; i < documentFiles.length; i++) {
        data.documents.push({
            name: documentFiles[i].name,
            size: documentFiles[i].size,
            type: documentFiles[i].type
        });
    }
    
    // Save data
    contentData[currentEditingIndex] = data;
    
    // Refresh grid
    initializeGrid();
    
    // Close modal
    closeModalHandler();
    
    alert('Content saved successfully!');
}

// Set current date in the form
function setCurrentDate() {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    document.getElementById('uploadDate').value = dateString;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Increment views when video is clicked
function incrementViews(index) {
    if (contentData[index]) {
        contentData[index].views = (contentData[index].views || 0) + 1;
        
        // Update the grid item display
        setTimeout(() => {
            initializeGrid();
        }, 100);
    }
}

// Utility function to clear all data (for testing)
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        contentData = {};
        initializeGrid();
        alert('All data cleared successfully!');
    }
}

// Export/Import functionality (bonus features)
function exportData() {
    const dataStr = JSON.stringify(contentData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pensioners_management_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                contentData = importedData;
                initializeGrid();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Search functionality (bonus feature)
function searchContent(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    for (const [index, data] of Object.entries(contentData)) {
        if (data.videoName && data.videoName.toLowerCase().includes(lowerQuery) ||
            data.videoDescription && data.videoDescription.toLowerCase().includes(lowerQuery)) {
            results.push({
                index: parseInt(index),
                page: Math.ceil(parseInt(index) / itemsPerPage),
                data: data
            });
        }
    }
    
    return results;
}