<template>
  <div>
    <v-btn text @click="$router.push('/')" class="mb-4">
      ← Назад к проектам
    </v-btn>

    <h1 class="text-h4 mb-4">
      Проект: {{ project?.name || 'Загрузка...' }}
    </h1>

    <!-- Заявки проекта -->
    <v-card class="mb-6">
      <v-card-title>Заявки проекта</v-card-title>
      <v-table>
        <thead>
          <tr>
            <th class="text-left" style="width: 50px">ID</th>
            <th class="text-left">Название</th>
            <th class="text-left" style="width: 150px">Статус</th>
            <th class="text-left" style="width: 150px">Действия</th>
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

    <!-- Непривязанные заявки -->
    <v-card>
      <v-card-title>Непривязанные заявки</v-card-title>
      <v-table>
        <thead>
          <tr>
            <th class="text-left" style="width: 50px">ID</th>
            <th class="text-left">Название</th>
            <th class="text-left" style="width: 150px">Статус</th>
            <th class="text-left" style="width: 180px">Действия</th>
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

export default {
  name: 'ProjectDetailView',
  data() {
    return {
      project: null,
      projectRequests: [],
      unboundRequests: []
    }
  },
  async created() {
    const projectId = this.$route.params.id
    await this.loadProject(projectId)
    await this.loadUnboundRequests()
  },
  methods: {
    ...mapActions(['fetchProject', 'fetchUnboundRequests', 'bindRequest', 'unbindRequest']),
    
    getStatusColor(code) {
      const colors = {
        'draft': 'grey',
        'in_progress': 'blue',
        'review': 'orange',
        'accepted': 'green',
        'rejected': 'red'
      }
      return colors[code] || 'grey'
    },
    
    async loadProject(id) {
      const project = await this.fetchProject(id)
      this.project = project
      this.projectRequests = project.Requests || []
    },
    
    async loadUnboundRequests() {
      await this.fetchUnboundRequests()
      this.unboundRequests = this.$store.state.requests
    },
    
    async unbindRequest(requestId) {
      await this.unbindRequest({ requestId, projectId: this.project.id })
      await this.loadProject(this.project.id)
      await this.loadUnboundRequests()
    },
    
    async bindRequest(requestId) {
      await this.bindRequest({ requestId, projectId: this.project.id })
      await this.loadProject(this.project.id)
      await this.loadUnboundRequests()
    }
  }
}
</script>