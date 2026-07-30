<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Проекты</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showForm = !showForm">
        {{ showForm ? 'Скрыть' : 'Новый проект' }}
      </v-btn>
    </div>

    <v-expand-transition>
      <ProjectForm
        v-if="showForm"
        :project="editingProject"
        @submit="handleFormSubmit"
        @cancel="showForm = false; editingProject = null"
      />
    </v-expand-transition>

    <v-card>
      <v-table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Заявок</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="text-center py-4">
              <v-progress-circular indeterminate color="primary" />
            </td>
          </tr>
          <tr v-else-if="projects.length === 0">
            <td colspan="4" class="text-center py-4 text-grey">
              Проектов пока нет. Создайте первый!
            </td>
          </tr>
          <tr
            v-for="project in projects"
            :key="project.id"
            class="cursor-pointer"
            @click="goToProject(project.id)"
          >
            <td>{{ project.id }}</td>
            <td>{{ project.name }}</td>
            <td>
              <v-chip size="small" color="blue-lighten-4">
                {{ project.requests ? project.requests.length : 0 }}
              </v-chip>
            </td>
            <td @click.stop>
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="startEdit(project)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="red"
                @click="deleteProject(project.id)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProjectForm from '../components/ProjectForm.vue'

export default {
  name: 'ProjectsView',
  components: { ProjectForm },
  data() {
    return {
      showForm: false,
      editingProject: null,
      loading: false
    }
  },
  computed: {
    ...mapGetters(['getProjects']),
    projects() {
      return this.getProjects
    }
  },
  async created() {
    this.loading = true
    try {
      await this.fetchProjects()
    } catch (err) {
      console.error('Ошибка загрузки проектов:', err)
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions(['fetchProjects', 'createProject', 'updateProject', 'deleteProject']),

    async handleFormSubmit(data) {
      try {
        if (this.editingProject) {
          await this.updateProject({ id: this.editingProject.id, data })
        } else {
          await this.createProject(data)
        }
        this.showForm = false
        this.editingProject = null
      } catch (err) {
        console.error('Ошибка сохранения:', err)
      }
    },

    startEdit(project) {
      this.editingProject = { ...project }
      this.showForm = true
    },

    async deleteProject(id) {
      if (!confirm('Удалить проект?')) return
      try {
        await this.$store.dispatch('deleteProject', id)
        await this.fetchProjects()
      } catch (err) {
        console.error('Ошибка удаления:', err)
      }
    },

    goToProject(id) {
      this.$router.push({ name: 'ProjectDetail', params: { id } })
    }
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>