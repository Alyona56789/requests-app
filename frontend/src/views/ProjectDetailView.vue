<template>
  <div>
    <v-btn text @click="$router.push('/')" class="mb-4">
      ← Назад к проектам
    </v-btn>

    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">
        Проект: {{ project?.name || 'Загрузка...' }}
      </h1>
      <v-spacer />
      <v-btn color="secondary" prepend-icon="mdi-file-plus" @click="showRequestForm = true">
        Добавить заявку в проект
      </v-btn>
    </div>

    <v-expand-transition>
      <RequestForm
        v-if="showRequestForm"
        :request="null"
        @submit="handleRequestSubmit"
        @cancel="showRequestForm = false"
      />
    </v-expand-transition>

    <v-card class="mb-6">
      <v-card-title>Заявки проекта</v-card-title>
      <v-table>
        <thead>
          <tr>
            <th style="width: 50px">ID</th>
            <th>Название</th>
            <th style="width: 150px">Статус</th>
            <th style="width: 150px">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="projectRequests.length === 0">
            <td colspan="4" class="text-center text-grey">
              В проекте пока нет заявок
            </td>
          </tr>
          <tr
            v-for="req in projectRequests"
            :key="req.id"
            @click="$router.push(`/request/${req.id}`)"
            style="cursor: pointer"
          >
            <td>{{ req.id }}</td>
            <td>{{ req.title }}</td>
            <td>
              <v-chip
                size="small"
                :color="getStatusColor(req.Status?.code)"
                text-color="white"
              >
                {{ req.Status?.name || '—' }}
              </v-chip>
            </td>
            <td @click.stop>
              <v-btn
                size="small"
                color="warning"
                variant="text"
                @click="unbindRequest(req.id)"
              >
                Открепить
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-card>
      <v-card-title>Непривязанные заявки</v-card-title>
      <v-table>
        <thead>
          <tr>
            <th style="width: 50px">ID</th>
            <th>Название</th>
            <th style="width: 150px">Статус</th>
            <th style="width: 180px">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="unboundRequests.length === 0">
            <td colspan="4" class="text-center text-grey">
              Все заявки уже привязаны к проектам
            </td>
          </tr>
          <tr
            v-for="req in unboundRequests"
            :key="req.id"
            @click="$router.push(`/request/${req.id}`)"
            style="cursor: pointer"
          >
            <td>{{ req.id }}</td>
            <td>{{ req.title }}</td>
            <td>
              <v-chip
                size="small"
                :color="getStatusColor(req.Status?.code)"
                text-color="white"
              >
                {{ req.Status?.name || '—' }}
              </v-chip>
            </td>
            <td @click.stop>
              <v-btn
                size="small"
                color="success"
                variant="text"
                @click="bindRequest(req.id)"
              >
                Включить в проект
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import RequestForm from '../components/RequestForm.vue'

export default {
  name: 'ProjectDetailView',
  components: { RequestForm },
  data() {
    return {
      project: null,
      projectRequests: [],
      unboundRequests: [],
      showRequestForm: false
    }
  },
  async created() {
    const projectId = this.$route.params.id
    await this.loadProject(projectId)
    await this.loadUnboundRequests()
  },
  methods: {
    ...mapActions({
      fetchProjectAction: 'fetchProject',
      fetchUnboundRequestsAction: 'fetchUnboundRequests',
      bindRequestAction: 'bindRequest',
      unbindRequestAction: 'unbindRequest',
      createRequestAction: 'createRequest'
    }),

    getStatusColor(code) {
      const colors = {
        draft: 'grey',
        in_progress: 'blue',
        review: 'orange',
        accepted: 'green',
        rejected: 'red'
      }
      return colors[code] || 'grey'
    },

    async loadProject(id) {
      try {
        const project = await this.fetchProjectAction(id)
        this.project = project
        this.projectRequests = project.Requests || []
      } catch (err) {
        console.error('Ошибка загрузки проекта:', err)
      }
    },

    async loadUnboundRequests() {
      try {
        await this.fetchUnboundRequestsAction()
        this.unboundRequests = this.$store.state.unboundRequests
      } catch (err) {
        console.error('Ошибка загрузки непривязанных заявок:', err)
      }
    },

    async handleRequestSubmit(data) {
      try {
        const projectId = this.$route.params.id
        await this.createRequestAction({ ...data, projectId: Number(projectId) })
        this.showRequestForm = false
        await this.loadProject(projectId)
        await this.loadUnboundRequests()
      } catch (err) {
        console.error('Ошибка создания заявки:', err)
      }
    },

    async unbindRequest(requestId) {
      try {
        const projectId = this.$route.params.id
        await this.unbindRequestAction({ requestId, projectId })
        await this.loadProject(projectId)
        await this.loadUnboundRequests()
      } catch (err) {
        console.error('Ошибка отвязки:', err)
      }
    },

    async bindRequest(requestId) {
      try {
        const projectId = this.$route.params.id
        await this.bindRequestAction({ requestId, projectId })
        await this.loadProject(projectId)
        await this.loadUnboundRequests()
      } catch (err) {
        console.error('Ошибка привязки:', err)
      }
    }
  }
}
</script>