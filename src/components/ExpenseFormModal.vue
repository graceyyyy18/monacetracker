<template>
  <ion-modal :is-open="isOpen" @didDismiss="emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ editingId ? 'Edit Expense' : 'Add Expense' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('close')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-input
          :model-value="form.expenseName"
          label="Expense Name"
          label-placement="stacked"
          placeholder="Example: Lunch"
          @ionInput="updateField('expenseName', $event.detail.value ?? '')"
        />
      </ion-item>

      <ion-item>
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
        <ion-select
          :value="form.category"
          label="Category"
          label-placement="stacked"
          @ionChange="updateField('category', $event.detail.value)"
        >
          <ion-select-option value="Food">Food</ion-select-option>
          <ion-select-option value="Transportation">Transportation</ion-select-option>
          <ion-select-option value="Bills">Bills</ion-select-option>
          <ion-select-option value="Shopping">Shopping</ion-select-option>
          <ion-select-option value="School">School</ion-select-option>
          <ion-select-option value="Entertainment">Entertainment</ion-select-option>
          <ion-select-option value="Health">Health</ion-select-option>
          <ion-select-option value="Others">Others</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-input
          :model-value="form.date"
          type="date"
          label="Date"
          label-placement="stacked"
          @ionInput="updateField('date', $event.detail.value ?? '')"
        />
      </ion-item>

      <ion-item>
        <ion-textarea
          :model-value="form.notes"
          label="Notes"
          label-placement="stacked"
          placeholder="Optional notes..."
          :auto-grow="true"
          @ionInput="updateField('notes', $event.detail.value ?? '')"
        />
      </ion-item>

      <ion-button expand="block" class="save-button" @click="emit('save')">
        {{ editingId ? 'Update Expense' : 'Save Expense' }}
      </ion-button>
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
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/vue'

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

const updateField = <K extends keyof ExpenseForm>(field: K, value: ExpenseForm[K]) => {
  emit('update:form', {
    ...props.form,
    [field]: value,
  })
}
</script>

<style scoped>
.save-button {
  margin-top: 25px;
}
</style>
