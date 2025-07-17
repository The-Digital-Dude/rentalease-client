import PropertyFormModal from "../PropertyFormModal";
import ConfirmationModal from "../ConfirmationModal";
import type { Property } from "../../services/propertyService";
import type { CreatePropertyData } from "../../services/propertyService";

interface PropertyModalsProps {
  isFormModalOpen: boolean;
  isDeleteModalOpen: boolean;
  editingProperty: Property | null;
  deletingProperty: Property | null;
  isSubmitting: boolean;
  onFormClose: () => void;
  onDeleteClose: () => void;
  onSubmit: (propertyData: CreatePropertyData) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
}

const PropertyModals = ({
  isFormModalOpen,
  isDeleteModalOpen,
  editingProperty,
  deletingProperty,
  isSubmitting,
  onFormClose,
  onDeleteClose,
  onSubmit,
  onConfirmDelete,
}: PropertyModalsProps) => {
  return (
    <>
      <PropertyFormModal
        isOpen={isFormModalOpen}
        onClose={onFormClose}
        onSubmit={onSubmit}
        editingProperty={editingProperty}
        isSubmitting={isSubmitting}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteClose}
        onConfirm={onConfirmDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${deletingProperty?.fullAddress}"? This action cannot be undone.`}
        confirmText="Delete Property"
        cancelText="Cancel"
        confirmButtonType="danger"
      />
    </>
  );
};

export default PropertyModals;
