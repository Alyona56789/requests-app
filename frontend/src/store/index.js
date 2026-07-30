import { createStore } from 'vuex'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default createStore({
  state: {
    projects: [],
    requests: [],
    currentProject: null,
    currentRequest: null,
    unboundRequests: []  
  },

  getters: {
    getProjects: state => state.projects,
    getRequests: state => state.requests,
    getCurrentProject: state => state.currentProject,
    getCurrentRequest: state => state.currentRequest,
    getUnboundRequests: state => state.unboundRequests
  },

  mutations: {
    SET_PROJECTS(state, projects) {
      state.projects = projects
    },
    SET_REQUESTS(state, requests) {
      state.requests = requests
    },
    SET_UNBOUND_REQUESTS(state, requests) {
      state.unboundRequests = requests
    },
    SET_CURRENT_PROJECT(state, project) {
      state.currentProject = project
    },
    SET_CURRENT_REQUEST(state, request) {
      state.currentRequest = request
    },
    ADD_PROJECT(state, project) {
      state.projects.push(project)
    },
    ADD_REQUEST(state, request) {
      state.requests.push(request)
    },
    UPDATE_REQUEST(state, updatedRequest) {
  const index = state.requests.findIndex(r => r.id === updatedRequest.id)
  if (index !== -1) {
    state.requests.splice(index, 1, updatedRequest)
  }
  const unboundIndex = state.unboundRequests.findIndex(r => r.id === updatedRequest.id)
  if (unboundIndex !== -1) {
    state.unboundRequests.splice(unboundIndex, 1, updatedRequest)
  }
  if (state.currentRequest && state.currentRequest.id === updatedRequest.id) {
    state.currentRequest = updatedRequest
  }
   },
    REMOVE_PROJECT(state, projectId) {
      state.projects = state.projects.filter(p => p.id !== projectId)
    },
    REMOVE_REQUEST(state, requestId) {
      state.requests = state.requests.filter(r => r.id !== requestId)
      state.unboundRequests = state.unboundRequests.filter(r => r.id !== requestId)
      if (state.currentRequest && state.currentRequest.id === requestId) {
        state.currentRequest = null
      }
    }
  },

  actions: {
    async fetchProjects({ commit }) {
      const response = await api.get('/projects/')
      commit('SET_PROJECTS', response.data)
    },
    async fetchProject({ commit }, projectId) {
      const response = await api.get(`/project/${projectId}/`)
      commit('SET_CURRENT_PROJECT', response.data)
      return response.data
    },
    async createProject({ commit }, projectData) {
      const response = await api.post('/project/', projectData)
      commit('ADD_PROJECT', response.data)
      return response.data
    },
    async updateProject({ commit }, { id, data }) {
      const response = await api.patch(`/project/${id}/`, data)
      commit('SET_CURRENT_PROJECT', response.data)
      return response.data
    },
    async deleteProject({ commit }, projectId) {
      await api.delete(`/project/${projectId}/`)
      commit('REMOVE_PROJECT', projectId)
    },

    async fetchUnboundRequests({ commit }) {
      const response = await api.get('/requests/')
      commit('SET_UNBOUND_REQUESTS', response.data)
    },
    async fetchRequest({ commit }, requestId) {
      const response = await api.get(`/request/${requestId}/`)
      commit('SET_CURRENT_REQUEST', response.data)
      return response.data
    },
    async createRequest({ commit }, requestData) {
      const response = await api.post('/request/', requestData)
      commit('ADD_REQUEST', response.data)
      return response.data
    },
    async updateRequest({ commit }, { id, data }) {
      const response = await api.patch(`/request/${id}/`, data)
      commit('UPDATE_REQUEST', response.data)
      return response.data
    },
    async deleteRequest({ commit }, requestId) {
      await api.delete(`/request/${requestId}/`)
      commit('REMOVE_REQUEST', requestId)
    },

    async bindRequest({ dispatch }, { requestId, projectId }) {
      const response = await api.post(`/request/${requestId}/bind/${projectId}/`)
      // Перезагружаем данные проекта и список непривязанных
      await dispatch('fetchProject', projectId)
      await dispatch('fetchUnboundRequests')
      return response.data
    },
    async unbindRequest({ dispatch }, { requestId, projectId }) {
      const response = await api.post(`/request/${requestId}/unbind/${projectId}/`)
      await dispatch('fetchProject', projectId)
      await dispatch('fetchUnboundRequests')
      return response.data
    },

   async changeRequestStatus({ dispatch }, { id, targetStatusId }) {
  try {
    const response = await api.post(
      `/request/${id}/status/change/`,
      { targetStatusId }
    )
    
    await dispatch('fetchRequest', id)
    return response.data
  } catch (error) {
    console.error('Ошибка смены статуса:', error.response?.data || error.message)
    throw error
  }
}

  }
})