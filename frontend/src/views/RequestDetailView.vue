<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center">
        <h2>Заявка #{{ request?.id }}</h2>
        <v-spacer />
        <v-btn variant="outlined" @click="$router.back()">
          ← Назад
        </v-btn>
      </v-card-title>

      <v-card-text v-if="loading">
        <v-progress-circular indeterminate />
      </v-card-text>

      <v-card-text v-else-if="request">
        <v-list>
          <v-list-item>
            <v-list-item-title>Название</v-list-item-title>
            <v-list-item-subtitle>{{ request.title }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Описание</v-list-item-title>
            <v-list-item-subtitle>
              {{ request.description || 'Нет описания' }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Текущий статус</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip :color="getStatusColor(request.Status?.code)" text-color="white">
                {{ request.Status?.name || 'Неизвестно' }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="request.Project">
            <v-list-item-title>Проект</v-list-item-title>
            <v-list-item-subtitle>{{ request.Project.name }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-divider class="my-4" />

        <h3 class="mb-4">Изменение статуса</h3>
        
        <div class="d-flex align-center gap-4 flex-wrap">
          
          <!-- Кнопка НАЗАД (текстовая) -->
          <v-btn
            v-if="availablePrevStatuses.length === 1"
            color="grey-darken-1"
            variant="outlined"
            :disabled="statusChanging"
            @click="changeToStatus(availablePrevStatuses[0].id)"
          >
            ← {{ availablePrevStatuses[0].name }}
          </v-btn>

          <!-- Текущий статус -->
          <v-chip
            :color="getStatusColor(request.Status?.code)"
            text-color="white"
            size="large"
            class="px-4 py-2"
          >
            {{ request.Status?.name || 'Неизвестно' }}
          </v-chip>

          <!-- ВПЕРЁД: если 
          ОДИН вариант - текстовая кнопка -->
          <v-btn
            v-if="availableNextStatuses.length === 1"
            color="primary"
            variant="outlined"
            :disabled="statusChanging"
            @click="changeToStatus(availableNextStatuses[0].id)"
          >
            {{ availableNextStatuses[0].name }} →
          </v-btn>

        </div>

        <div v-if="availableNextStatuses.length > 1" class="d-flex justify-center gap-8 mt-6">
          <div 
            v-for="status in availableNextStatuses" 
            :key="status.id"
            class="arrow-down-wrapper"
            @click="!statusChanging && changeToStatus(status.id)"
          >
            <div 
              class="arrow-down"
              :style="{ color: getStatusColor(status.code) }"
            >
              ↓
            </div>
            <div class="arrow-label">
              {{ status.name }}
            </div>
          </div>
        </div>

        <!-- Сообщение если нет переходов -->
        <v-alert 
          v-if="availableNextStatuses.length === 0 && availablePrevStatuses.length === 0" 
          type="info" 
          class="mt-4"
        >
          Для текущего статуса нет доступных переходов
        </v-alert>

        <v-alert v-if="error" type="error" class="mt-4">
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-text v-else>
        <v-alert type="error">Заявка не найдена</v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'RequestDetailView',
  data() {
    return {
      loading: true,
      statusChanging: false,
      error: null,
      availableNextStatuses: [],
      availablePrevStatuses: []
    }
  },
  computed: {
    ...mapGetters(['getCurrentRequest']),
    request() {
      return this.getCurrentRequest
    }
  },
  async mounted() {
    await this.loadRequest()
  },
  methods: {
    async loadRequest() {
      this.loading = true
      this.error = null

      try {
        const requestId = this.$route.params.id
        await this.$store.dispatch('fetchRequest', requestId)
        await this.loadStatusTransitions()
      } catch (err) {
        this.error = 'Ошибка загрузки заявки: ' + (err.response?.data?.error || err.message)
        console.error('Ошибка:', err)
      } finally {
        this.loading = false
      }
    },

    async loadStatusTransitions() {
      try {
        const requestId = this.$route.params.id
        const response = await axios.get(`http://localhost:3000/request/${requestId}/status/transitions/`)
        
        console.log('Доступные переходы:', response.data)
        
        this.availableNextStatuses = response.data.next || []
        this.availablePrevStatuses = response.data.prev || []
      } catch (err) {
        console.error('Ошибка загрузки переходов:', err)
        this.error = 'Не удалось загрузить доступные статусы'
      }
    },

    async changeToStatus(targetStatusId) {
      this.error = null
      this.statusChanging = true

      try {
        const requestId = this.$route.params.id
        
        await this.$store.dispatch('changeRequestStatus', { 
          id: requestId, 
          targetStatusId 
        })
        
        await this.loadRequest()
      } catch (err) {
        this.error = 'Ошибка смены статуса: ' + (err.response?.data?.error || err.message)
      } finally {
        this.statusChanging = false
      }
    },

    getStatusColor(code) {
      const colors = {
        draft: 'grey',
        in_progress: 'blue',
        review: 'orange',
        accepted: 'green',
        rejected: 'red'
      }
      return colors[code] || 'grey'
    }
  }
}
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
.gap-8 {
  gap: 64px;
}
.flex-wrap {
  flex-wrap: wrap;
}

.arrow-down-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  user-select: none;
}

.arrow-down-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(4px);
}

.arrow-down {
  font-size: 72px;
  font-weight: bold;
  line-height: 1;
  transition: transform 0.2s ease;
}

.arrow-down-wrapper:hover .arrow-down {
  transform: translateY(8px);
}

.arrow-label {
  margin-top: 12px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  color: #333;
}
</style>