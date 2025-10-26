console.log("🎨 Modal Helper - Loaded");

/**
 * Modal Helper - Unified modal styling for the application
 */
class ModalHelper {
  constructor() {
    this.activeModals = new Set();
  }

  /**
   * Get consistent modal styles
   */
  getModalStyles() {
    return `
      <style id="global-modal-styles">
        /* Bootstrap Modal Overrides */
        .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.5);
        }
        
        .modal-backdrop.show {
          opacity: 1;
        }
        
        .modal-dialog {
          max-width: 800px;
          margin: 1.75rem auto;
        }
        
        .modal-content {
          border-radius: 12px;
          border: none;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        
        .modal-header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 12px 12px 0 0;
          padding: 1rem 1.5rem;
          border-bottom: none;
        }
        
        .modal-title {
          font-size: 1.25rem;
          font-weight: 500;
          color: white;
        }
        
        .modal-header .btn-close {
          filter: brightness(0) invert(1);
          opacity: 0.8;
        }
        
        .modal-header .btn-close:hover {
          opacity: 1;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #dee2e6;
          background-color: #f8f9fa;
          border-radius: 0 0 12px 12px;
        }
        
        /* Custom Modal (for non-Bootstrap modals) */
        .custom-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1055;
          overflow-y: auto;
          padding: 0;
          animation: fadeIn 0.15s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .custom-modal-container {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 800px;
          margin: 1.75rem auto;
          max-height: calc(100vh - 3.5rem);
          display: flex;
          flex-direction: column;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          animation: slideUp 0.3s;
          position: relative;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .custom-modal-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }
        
        .custom-modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 500;
        }
        
        .custom-modal-close {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: white;
          opacity: 0.8;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.15s;
        }
        
        .custom-modal-close:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .custom-modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        
        .custom-modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          background: #f8f9fa;
          border-radius: 0 0 12px 12px;
        }
        
        /* Form Controls */
        .form-control,
        .form-select {
          border: 1px solid #ced4da;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 0.25rem rgba(99, 102, 241, 0.25);
          outline: none;
        }
        
        /* Buttons */
        .btn-primary {
          background-color: #6366f1;
          border-color: #6366f1;
        }
        
        .btn-primary:hover {
          background-color: #4f46e5;
          border-color: #4f46e5;
        }
        
        .btn-custom-teal {
          background: linear-gradient(135deg, #5CD4C8 0%, #4AC4B8 100%);
          color: white;
          border: none;
          border-radius: 0.375rem;
          padding: 0.5rem 1rem;
          font-weight: 500;
        }
        
        .btn-custom-teal:hover {
          background: linear-gradient(135deg, #4AC4B8 0%, #3AB3A8 100%);
          color: white;
        }
      </style>
    `;
  }

  /**
   * Initialize modal styles (call once when app loads)
   */
  initializeStyles() {
    if (!document.getElementById("global-modal-styles")) {
      document.head.insertAdjacentHTML("beforeend", this.getModalStyles());
      console.log("✅ Modal styles initialized");
    }
  }

  /**
   * Show a Bootstrap modal
   */
  showBootstrapModal(modalId, options = {}) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) {
      console.error(`❌ Modal ${modalId} not found`);
      return null;
    }

    const modal = new bootstrap.Modal(modalEl, {
      backdrop: options.backdrop || "static",
      keyboard: options.keyboard !== false,
      ...options,
    });

    modal.show();
    this.activeModals.add(modalId);

    modalEl.addEventListener(
      "hidden.bs.modal",
      () => {
        this.activeModals.delete(modalId);
      },
      { once: true }
    );

    return modal;
  }

  /**
   * Hide a Bootstrap modal
   */
  hideBootstrapModal(modalId) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
      modal.hide();
      this.activeModals.delete(modalId);
    }
  }

  /**
   * Create a custom modal (non-Bootstrap)
   */
  createCustomModal(config) {
    const { id, title, body, footer, onClose, width = "800px" } = config;

    const existingModal = document.getElementById(id);
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div id="${id}" class="custom-modal-overlay">
        <div class="custom-modal-container" style="max-width: ${width};">
          <div class="custom-modal-header">
            <h2>${title}</h2>
            <button class="custom-modal-close" onclick="window.modalHelper.closeCustomModal('${id}')">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="custom-modal-body">
            ${body}
          </div>
          ${footer ? `<div class="custom-modal-footer">${footer}</div>` : ""}
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.activeModals.add(id);

    // Add close handler
    if (onClose) {
      const modalEl = document.getElementById(id);
      modalEl.addEventListener("click", (e) => {
        if (e.target === modalEl) {
          this.closeCustomModal(id);
          onClose();
        }
      });
    }

    return id;
  }

  /**
   * Close a custom modal
   */
  closeCustomModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.animation = "fadeOut 0.15s";
      setTimeout(() => {
        modal.remove();
        this.activeModals.delete(modalId);
      }, 150);
    }
  }

  /**
   * Close all modals
   */
  closeAll() {
    this.activeModals.forEach((modalId) => {
      this.closeCustomModal(modalId);
      this.hideBootstrapModal(modalId);
    });
  }
}

// Create global instance
window.modalHelper = new ModalHelper();

console.log("✅ Modal Helper initialized");
