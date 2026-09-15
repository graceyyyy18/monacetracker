<template>
  <ion-modal :is-open="isOpen" @didDismiss="emit('close')">
    <ion-header>
      <ion-toolbar>
        <div class="modal-heading">
          <div class="modal-heading-icon">
            <ion-icon :icon="editingId ? createOutline : addOutline" aria-hidden="true" />
          </div>
          <div>
            <ion-title>{{ editingId ? 'Edit Expense' : 'Add Expense' }}</ion-title>
            <p>{{ editingId ? 'Update your expense details below.' : 'Add a new expense to your tracker.' }}</p>
          </div>
        </div>
        <ion-buttons slot="end">
          <ion-button class="modal-close-button" aria-label="Close expense form" @click="emit('close')">
            <ion-icon :icon="closeOutline" aria-hidden="true" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding modal-content">
      <div class="form-layout">
        <section class="category-panel">
          <div class="section-copy">
            <h2>Category</h2>
            <p>Select the category for this expense.</p>
          </div>

          <div class="category-grid">
            <button
              v-for="category in categories"
              :key="category.name"
              class="category-option"
              :class="{ selected: form.category === category.name }"
              type="button"
              :aria-pressed="form.category === category.name"
              @click="updateField('category', category.name)"
            >
              <span class="category-option-icon">
                <ion-icon :icon="category.icon" aria-hidden="true" />
              </span>
              <span>{{ category.label }}</span>
              <ion-icon v-if="form.category === category.name" class="selected-check" :icon="checkmarkCircle" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section class="field-panel">
          <ion-item>
            <ion-icon :icon="documentTextOutline" slot="start" aria-hidden="true" />
            <ion-input
              :model-value="form.expenseName"
              label="Expense Name"
              label-placement="stacked"
              placeholder="Example: Lunch"
              @ionInput="updateField('expenseName', $event.detail.value ?? '')"
            />
          </ion-item>

          <ion-item>
            <span class="currency-prefix">₱</span>
            <ion-input
              :model-value="String(form.amount)"
              type="number"
              label="Amount"
              label-placement="stacked"
              placeholder="Example: 120"
              @ionInput="updateField('amount', Number($event.detail.value ?? 0))"
            />
          </ion-item>

          <ion-item>
            <ion-icon :icon="calendarOutline" slot="start" aria-hidden="true" />
            <ion-input
              :model-value="form.date"
              type="date"
              label="Date"
              label-placement="stacked"
              @ionInput="updateField('date', $event.detail.value ?? '')"
            />
          </ion-item>

          <ion-item class="notes-item">
            <ion-icon :icon="createOutline" slot="start" aria-hidden="true" />
            <ion-textarea
              :model-value="form.notes"
              label="Notes"
              label-placement="stacked"
              placeholder="Optional notes..."
              :auto-grow="true"
              @ionInput="updateField('notes', $event.detail.value ?? '')"
            />
          </ion-item>
        </section>
      </div>

      <div class="modal-actions">
        <ion-button fill="clear" class="cancel-button" @click="emit('close')">Cancel</ion-button>
        <ion-button expand="block" class="save-button" @click="emit('save')">
          {{ editingId ? 'Update Expense' : 'Save Expense' }}
        </ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonInput,
  IonTextarea,
  IonIcon,
} from '@ionic/vue'
import {
  addOutline,
  calendarOutline,
  checkmarkCircle,
  closeOutline,
  createOutline,
  documentTextOutline,
  gameControllerOutline,
  medicalOutline,
  receiptOutline,
  restaurantOutline,
  carOutline,
  bagHandleOutline,
  walletOutline,
} from 'ionicons/icons'

interface ExpenseForm {
  expenseName: string
  amount: number
  category: string
  date: string
  notes: string
}

interface Props {
  isOpen: boolean
  editingId: string | null
  form: ExpenseForm
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: []
  'update:form': [form: ExpenseForm]
}>()

const categories = [
  { name: 'Food', label: 'Food', icon: restaurantOutline },
  { name: 'Transportation', label: 'Transport', icon: carOutline },
  { name: 'Bills', label: 'Bills', icon: receiptOutline },
  { name: 'Shopping', label: 'Shopping', icon: bagHandleOutline },
  { name: 'School', label: 'School', icon: documentTextOutline },
  { name: 'Entertainment', label: 'Entertainment', icon: gameControllerOutline },
  { name: 'Health', label: 'Health', icon: medicalOutline },
  { name: 'Others', label: 'Other', icon: walletOutline },
]

const updateField = <K extends keyof ExpenseForm>(field: K, value: ExpenseForm[K]) => {
  emit('update:form', {
    ...props.form,
    [field]: value,
  })
}
</script>

<style scoped>
ion-modal {
  --width: min(920px, calc(100% - 32px));
  --height: min(720px, calc(100% - 32px));
  --border-radius: 20px;
  --box-shadow: 0 24px 70px rgba(30, 27, 75, 0.22);
}

ion-toolbar {
  --background: #ffffff;
  --border-color: #e5e7eb;
  --min-height: 98px;
  padding: 18px 26px;
}

.modal-heading {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-heading-icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 50%;
  background: #f3e8ff;
  color: #7c3aed;
  font-size: 1.6rem;
}

ion-title {
  padding: 0;
  color: #1e1b4b;
  font-size: 1.45rem;
  font-weight: 750;
}

.modal-heading p {
  margin: 3px 0 0;
  color: #6b7280;
  font-size: 0.86rem;
}

.modal-close-button {
  --color: #9ca3af;
  margin: 0;
  font-size: 1.5rem;
}

.form-layout {
  display: grid;
  grid-template-columns: 294px minmax(0, 1fr);
  gap: 28px;
  padding: 18px 4px 4px;
}

.category-panel {
  padding: 18px;
  border-radius: 16px;
  background: #f5f3ff;
}

.section-copy h2 {
  margin: 0;
  color: #1e1b4b;
  font-size: 1rem;
}

.section-copy p {
  margin: 6px 0 16px;
  color: #6b7280;
  font-size: 0.78rem;
  line-height: 1.4;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.category-option {
  position: relative;
  display: flex;
  min-height: 92px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  color: #37306b;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 700;
  transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
}

.category-option:hover {
  border-color: #a78bfa;
  transform: translateY(-1px);
}

.category-option.selected {
  border: 2px solid #7c3aed;
  background: #ffffff;
  color: #7c3aed;
}

.category-option-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  background: #ede9fe;
  color: #7c3aed;
  font-size: 1.15rem;
}

.selected-check {
  position: absolute;
  right: 7px;
  top: 7px;
  color: #7c3aed;
  font-size: 1rem;
}

.field-panel {
  min-width: 0;
}

.field-panel ion-item {
  --background: #ffffff;
  --border-radius: 12px;
  --inner-border-width: 0;
  --padding-start: 14px;
  margin: 0 0 12px;
  border: 1px solid #ddd6fe;
  box-shadow: none;
}

.field-panel ion-item:focus-within {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.field-panel ion-item > ion-icon {
  margin-right: 10px;
  color: #7c3aed;
  font-size: 1.15rem;
}

.currency-prefix {
  margin-right: 10px;
  color: #7c3aed;
  font-size: 1.25rem;
  font-weight: 800;
}

.notes-item {
  align-items: flex-start;
}

.modal-content {
  --background: #f8f7fc;
}

.save-button {
  flex: 1;
  margin: 0;
  --background: #7c3aed;
  --background-hover: #6d28d9;
  --background-activated: #6d28d9;
  --color: #ffffff;
  height: 48px;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 4px 0;
  padding-top: 18px;
  border-top: 1px solid #e5e7eb;
}

.cancel-button,
.modal-close-button {
  --color: #6b7280;
  font-weight: 650;
}

.cancel-button {
  min-width: 92px;
  margin: 0;
}

@media (max-width: 480px) {
  ion-modal {
    --width: calc(100% - 16px);
    --height: calc(100% - 16px);
  }

  ion-toolbar {
    padding: 12px 16px;
  }

  .modal-heading-icon {
    width: 42px;
    height: 42px;
    font-size: 1.25rem;
  }

  ion-title {
    font-size: 1.1rem;
  }

  .modal-heading p {
    font-size: 0.75rem;
  }

  .form-layout {
    grid-template-columns: 1fr;
    gap: 16px;
    padding-top: 8px;
  }

  .category-panel {
    padding: 14px;
  }

  .category-option {
    min-height: 82px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .save-button,
  .cancel-button {
    width: 100%;
  }
}
</style>
