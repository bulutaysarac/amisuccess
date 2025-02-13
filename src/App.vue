<script setup>
import { ref, computed, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';

// Status options
const statusOptions = [
  'Groomed', 'Backlog', 'Development In Progress', 'Development Done',
  'Code Review Done', 'QA In Progress', 'QA Done', 
  'UAT OPAM', 'UAT PARTNER', 'DONE'
];

// Load tasks and target from localStorage
const tasks = ref([]);
const targetValue = ref(null);

const loadTasks = () => {
  const storedTasks = JSON.parse(localStorage.getItem('jiraTasks') ?? '[]');
  tasks.value = storedTasks.map(task => ({
    ...task,
    id: task.id,
    storyPoints: Number(task.storyPoints) || 0,
    updatedStoryPoints: Number(task.updatedStoryPoints) || 0
  }));

  targetValue.value = JSON.parse(localStorage.getItem('targetValue')) ?? null;
};

onMounted(loadTasks);

// Save tasks to localStorage
const saveTasks = () => {
  localStorage.setItem('jiraTasks', JSON.stringify(tasks.value));
};

// Save target to localStorage
const saveTarget = () => {
  if (!targetValue.value || targetValue.value < 0) {
    showErrorDialog("Please enter a valid target!");
    return;
  }
  localStorage.setItem('targetValue', JSON.stringify(targetValue.value));
  showTargetDialog.value = false;
};

// Modal states
const showModal = ref(false);
const showTargetDialog = ref(false);
const isEditing = ref(false);
const selectedTaskId = ref(null);
const showDeleteDialog = ref(false);
const taskToDelete = ref(null);
const showError = ref(false);
const errorMessage = ref("");

// Task form
const taskForm = ref({
  id: '',
  status: '',
  storyPoints: 1,
  updatedStoryPoints: 1
});

// Open modal for adding a task
const openAddModal = () => {
  isEditing.value = false;
  taskForm.value = { id: '', status: '', storyPoints: 1, updatedStoryPoints: 1 };
  showModal.value = true;
};

// Open modal for editing a task
const openEditModal = (task) => {
  isEditing.value = true;
  selectedTaskId.value = task.id;
  taskForm.value = { ...task };
  showModal.value = true;
};

// Add or update task
const saveTask = () => {
  if (!taskForm.value.id.trim()) {
    showErrorDialog("Task ID is required!");
    return;
  }
  if (!taskForm.value.status) {
    showErrorDialog("Please select a status!");
    return;
  }

  if (isEditing.value) {
    const index = tasks.value.findIndex(t => t.id === selectedTaskId.value);
    if (index !== -1) {
      tasks.value[index] = { ...taskForm.value };
    }
  } else {
    tasks.value.push({ ...taskForm.value });
  }

  saveTasks();
  showModal.value = false;
};

// Open delete confirmation dialog
const confirmDeleteTask = (task) => {
  taskToDelete.value = task;
  showDeleteDialog.value = true;
};

// Delete a task
const deleteTask = () => {
  if (taskToDelete.value) {
    tasks.value = tasks.value.filter(task => task.id !== taskToDelete.value.id);
    saveTasks();
  }
  showDeleteDialog.value = false;
  taskToDelete.value = null;
};

// Redirect to Jira task
const goToTask = (id) => {
  const taskUrl = `https://winsider.atlassian.net/browse/${id}`;
  window.open(taskUrl, '_blank');
};

// Compute total story points
const totalStoryPoints = computed(() => {
  return tasks.value.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
});

// Compute updated total story points
const updatedTotalStoryPoints = computed(() => {
  return tasks.value.reduce((sum, task) => sum + (task.updatedStoryPoints || 0), 0);
});

// Determine success or failure
const isSuccess = computed(() => {
  return targetValue.value !== null && totalStoryPoints.value >= targetValue.value;
});

// Second check with updated story points
const isSuccessWithUpdatedPoints = computed(() => {
  return targetValue.value !== null && updatedTotalStoryPoints.value >= targetValue.value;
});

const openTargetDialog = () => {
  showTargetDialog.value = true;
};

// Show error dialog
const showErrorDialog = (message) => {
  errorMessage.value = message;
  showError.value = true;
};
</script>

<template>
  <div class="w-3/4 mx-auto p-6 relative">
    <!-- Target Display -->
    <div class="absolute top-4 right-4 bg-gray-200 px-4 py-2 rounded-lg shadow-md">
      <span class="text-gray-700 font-semibold">Target:</span>
      <span class="text-blue-600 font-bold ml-2">{{ targetValue ?? 'Not Set' }}</span>
    </div>

    <h1 class="text-3xl font-bold text-center mb-6">Am I Success?</h1>

    <!-- Buttons Row -->
    <div class="flex justify-between items-center mb-4">
      <Button label="Add New Task" icon="pi pi-plus" class="bg-blue-500 text-white p-3 shadow-md" @click="openAddModal" />
      <Button label="Set Target" icon="pi pi-flag" class="bg-purple-500 text-white p-3 shadow-md" @click="openTargetDialog" />
    </div>

    <div class="shadow-md overflow-hidden">
      <DataTable :value="tasks" class="w-full border border-gray-200">
        <Column field="id" header="Task ID">
          <template #body="slotProps">
            <a @click="goToTask(slotProps.data.id)" class="text-blue-500 underline cursor-pointer">
              {{ slotProps.data.id }}
            </a>
          </template>
        </Column>
        <Column field="status" header="Status"></Column>
        <Column field="storyPoints" header="Story Points"></Column>
        <Column field="updatedStoryPoints" header="Updated Story Points"></Column>
        <Column header="Actions">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" severity="warn" class="text-white p-2 rounded-md mr-2" @click="openEditModal(slotProps.data)" />
            <Button icon="pi pi-trash" severity="danger" class="text-white p-2 rounded-md" @click="confirmDeleteTask(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Total Story Points & Success Message -->
    <div class="mt-6 text-center">
      <p class="text-lg font-semibold text-gray-700">Total Story Points: <span class="text-blue-600">{{ totalStoryPoints }}</span></p>
      <p class="text-lg font-semibold text-gray-700">Updated Story Points: <span class="text-blue-600">{{ updatedTotalStoryPoints }}</span></p>

      <p class="text-9xl font-bold mt-4" :class="isSuccess ? 'text-green-500' : 'text-red-500'">
        {{ isSuccess ? 'Yes, you are!' : 'No, you are not.' }}
      </p>

      <p v-if="!isSuccess && isSuccessWithUpdatedPoints" class="text-green-500 font-bold text-6xl mt-4">But you still have a chance with updated efforts. You better prepare your effort notes perfectly!</p>
      <p v-if="!isSuccessWithUpdatedPoints" class="text-gray-500 font-bold text-6xl mt-4">Welcome to pipe!</p>
    </div>

    <!-- Add/Edit Task Dialog -->
    <Dialog v-model:visible="showModal" :header="isEditing ? 'Edit Task' : 'Add New Task'" :modal="true" class="w-3/4">
      <div class="p-6">
        <label class="font-bold mt-4">Task ID:</label>
        <InputText v-model="taskForm.id" class="w-full mb-2" />

        <label class="font-bold mt-4">Status:</label>
        <Dropdown v-model="taskForm.status" :options="statusOptions" class="w-full mb-2" placeholder="Select a status" />

        <label class="font-bold mt-4">Story Points:</label>
        <InputNumber v-model="taskForm.storyPoints" :min="0" class="w-full mb-2" />

        <label class="font-bold mt-4">Updated Story Points:</label>
        <InputNumber v-model="taskForm.updatedStoryPoints" :min="0" class="w-full mb-2" />

        <Button label="Save" icon="pi pi-check" class="bg-green-500 text-white w-full mt-6" @click="saveTask" />
      </div>
    </Dialog>

    <!-- Set Target Dialog -->
    <Dialog v-model:visible="showTargetDialog" header="What is your target?" :modal="true" :closable="true" class="w-1/2">
      <div class="p-6 relative">
        <label class="block text-gray-700 font-bold mb-2">Target Value:</label>
        <InputNumber v-model="targetValue" :min="0" class="w-full mb-2" />
        <Button label="Save" icon="pi pi-check" class="bg-green-500 text-white px-4 py-2 rounded-lg w-full mt-6" @click="saveTarget" />
      </div>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="showDeleteDialog" header="Confirm Deletion" :modal="true">
      <p>Are you sure you want to delete this task?</p>
      <Button label="Delete" icon="pi pi-trash" severity="danger" class="bg-red-500 text-white mt-4 w-full" @click="deleteTask" />
    </Dialog>

    <!-- Error Dialog -->
    <Dialog v-model:visible="showError" header="Error" :modal="true">
      <p class="text-red-600 font-semibold">{{ errorMessage }}</p>
    </Dialog>
  </div>
</template>