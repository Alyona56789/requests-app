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
    currentRequest: null
  },
  getters: {
    getProjects: state => state.projects,
    getRequests: state => state.requests,
    getCurrentProject: state => state.currentProject,
    getCurrentRequest: state => state.currentRequest
  },
  mutations: {
    SET_PROJECTS(state, projects) {
      state.projects = projects
    },
    SET_REQUESTS(state, requests) {
      state.requests = requests
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
        state.requests[index] = updatedRequest
      }
    },
    REMOVE_REQUEST_FROM_PROJECT(state, requestId) {
      state.requests = state.requests.filter(r => r.id !== requestId)
    },
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
    
    async fetchUnboundRequests({ commit }) {
      const response = await api.get('/requests/')
      commit('SET_REQUESTS', response.data)
    },
    async fetchProjectRequests({ commit }, projectId) {
      const response = await api.get(`/project/${projectId}/`)
      commit('SET_REQUESTS', response.data.Requests || [])
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
    async changeRequestStatus({ commit }, { id, action }) {
      const response = await api.post(`/request/${id}/status/${action}/`)
      commit('UPDATE_REQUEST', response.data.request)
      return response.data
    },
    async bindRequest({ commit }, { requestId, projectId }) {
      const response = await api.post(`/request/${requestId}/bind/${projectId}/`)
      commit('UPDATE_REQUEST', response.data)
      return response.data
    },
    async unbindRequest({ commit, dispatch }, { requestId, projectId }) {
      const response = await api.post(`/request/${requestId}/unbind/${projectId}/`)
      await dispatch('fetchProject', projectId)
      await dispatch('fetchUnboundRequests')
      return response.data
},
  }
})