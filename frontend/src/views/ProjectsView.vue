<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Проекты</h1>
      <v-spacer />
      <!-- Кнопка создания проекта -->
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showProjectForm = true" class="mr-2">
        Новый проект
      </v-btn>
      <v-btn color="secondary" prepend-icon="mdi-file-plus" @click="showRequestForm = true">
        Новая заявка
      </v-btn>
    </div>

    <v-expand-transition>
      <ProjectForm
        v-if="showProjectForm"
        :project="editingProject"
        @submit="handleProjectSubmit"
        @cancel="showProjectForm = false; editingProject = null"
      />
    </v-expand-transition>

    <v-expand-transition>
      <RequestForm
        v-if="showRequestForm"
        :request="editingRequest"
        @submit="handleRequestSubmit"
        @cancel="showRequestForm = false; editingRequest = null"
      />
    </v-expand-transition>

    <v-card>
      <v-table>
        <thead>
          <tr>
            <th style="width: 60px">ID</th>
            <th>Название</th>
            <th style="width: 100px">Заявок</th>
            <th style="width: 220px">Действия</th>
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
                {{ project.Requests ? project.Requests.length : 0 }}
              </v-chip>
            </td>
            <td @click.stop>
              <div class="d-flex gap-1">
                <v-btn
                  size="small"
                  variant="outlined"
                  color="primary"
                  @click="startEditProject(project)"
                >
                  Изменить
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  color="error"
                  @click="deleteProject(project.id)"
                >
                  Удалить
                </v-btn>
              </div>
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
import RequestForm from '../components/RequestForm.vue'

export default {
  name: 'ProjectsView',
  components: { ProjectForm, RequestForm },
  data() {
    return {
      showProjectForm: false,
      showRequestForm: false,
      editingProject: null,
      editingRequest: null,
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
    ...mapActions(['fetchProjects', 'createProject', 'updateProject', 'deleteProject', 'createRequest']),

    // Обработка формы проекта
    async handleProjectSubmit(data) {
      try {
        if (this.editingProject) {
          await this.updateProject({ id: this.editingProject.id, data })
        } else {
          await this.createProject(data)
        }
        this.showProjectForm = false
        this.editingProject = null
        await this.fetchProjects()
      } catch (err) {
        console.error('Ошибка сохранения проекта:', err)
      }
    },

    async handleRequestSubmit(data) {
      try {
        await this.createRequest(data)
        this.showRequestForm = false
        this.editingRequest = null
        // Обновляем список проектов (чтобы показать новые счётчики)
        await this.fetchProjects()
      } catch (err) {
        console.error('Ошибка создания заявки:', err)
      }
    },

    startEditProject(project) {
      this.editingProject = { ...project }
      this.showProjectForm = true
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
.d-flex.gap-1 > .v-btn {
  margin-right: 8px;
}
.d-flex.gap-1 > .v-btn:last-child {
  margin-right: 0;
}
</style>