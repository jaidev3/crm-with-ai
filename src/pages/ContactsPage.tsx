import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Input,
  Button,
  Spinner,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useContacts } from "../hooks/useContacts";
import { ContactForm } from "../components/ContactForm";
import type { Contact, ContactFilters } from "../types";

const ContactsPage: React.FC = () => {
  const [filters, setFilters] = useState<ContactFilters>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const { contacts, loading, error, deleteContact, refresh } =
    useContacts(filters);

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  const handleCompanyFilter = (company: string) => {
    setFilters((prev) => ({ ...prev, company: company || undefined }));
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    onEditOpen();
  };

  const handleDelete = (contact: Contact) => {
    setContactToDelete(contact);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (contactToDelete) {
      try {
        await deleteContact(contactToDelete.id);
        setIsDeleteConfirmOpen(false);
        setContactToDelete(null);
      } catch (error) {
        console.error("Failed to delete contact:", error);
      }
    }
  };

  const handleFormSuccess = () => {
    onCreateClose();
    onEditClose();
    setSelectedContact(null);
    refresh();
  };

  const handleViewContact = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  // Get unique companies for filter
  const companies = Array.from(
    new Set(contacts.map((contact) => contact.company).filter(Boolean))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Contacts</h1>
          <p className="text-text-secondary mt-2">
            Manage your contact relationships
          </p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={onCreateOpen}
        >
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-surface border border-border">
        <CardBody>
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search contacts..."
              startContent={
                <MagnifyingGlassIcon className="w-4 h-4 text-text-secondary" />
              }
              value={filters.search || ""}
              onValueChange={handleSearch}
              className="max-w-xs"
            />
            <Select
              label="Filter by Company"
              placeholder="All companies"
              selectedKeys={filters.company ? [filters.company] : []}
              onSelectionChange={(keys) => {
                const company = Array.from(keys)[0] as string;
                handleCompanyFilter(company || "");
              }}
              className="w-full sm:w-48"
            >
              {[
                <SelectItem key="">All companies</SelectItem>,
                ...companies.map((company) => (
                  <SelectItem key={company} textValue={company}>
                    {company}
                  </SelectItem>
                )),
              ]}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-error bg-error-50">
          <CardBody>
            <p className="text-error-600">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <Card
            key={contact.id}
            className="bg-surface border border-border hover:shadow-lg transition-shadow cursor-pointer"
            isPressable
            onPress={() => handleViewContact(contact.id)}
          >
            <CardBody>
              <div className="space-y-3">
                {/* Contact Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {contact.name}
                    </h3>
                    {contact.job_title && (
                      <p className="text-sm text-text-secondary">
                        {contact.job_title}
                      </p>
                    )}
                  </div>
                  <div
                    className="flex gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleViewContact(contact.id)}
                      title="View Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleEdit(contact)}
                      title="Edit Contact"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(contact)}
                      title="Delete Contact"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>

                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}

                  {contact.company && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <BuildingOfficeIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{contact.company}</span>
                    </div>
                  )}
                </div>

                {/* Contact Meta */}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-text-secondary">
                    Added {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {contacts.length === 0 && !loading && (
        <Card>
          <CardBody className="text-center py-12">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto">
                <PlusIcon className="w-8 h-8 text-text-secondary" />
              </div>
              <h3 className="text-lg font-medium text-text-primary">
                No contacts found
              </h3>
              <p className="text-text-secondary">
                {filters.search || filters.company
                  ? "Try adjusting your filters or search terms"
                  : "Get started by adding your first contact"}
              </p>
              {!filters.search && !filters.company && (
                <Button color="primary" onPress={onCreateOpen}>
                  Add Your First Contact
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Create Contact Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="2xl">
        <ModalContent>
          <ModalHeader>Add New Contact</ModalHeader>
          <ModalBody>
            <ContactForm onSuccess={handleFormSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
        <ModalContent>
          <ModalHeader>Edit Contact</ModalHeader>
          <ModalBody>
            {selectedContact && (
              <ContactForm
                contact={selectedContact}
                onSuccess={handleFormSuccess}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete{" "}
              <strong>{contactToDelete?.name}</strong>? This action cannot be
              undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ContactsPage;
