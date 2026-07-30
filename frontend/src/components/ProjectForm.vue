<template>
  <v-card class="pa-4 mb-4">
    <v-card-title>
      {{ isEdit ? 'Редактировать проект' : 'Новый проект' }}
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="form.name"
        label="Название проекта"
        variant="outlined"
        density="compact"
        :rules="[v => !!v || 'Название обязательно']"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn color="grey" variant="text" @click="$emit('cancel')">
        Отмена
      </v-btn>
      <v-btn color="primary" @click="submit">
        {{ isEdit ? 'Сохранить' : 'Создать' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'ProjectForm',
  props: {
    project: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      form: {
        name: ''
      }
    }
  },
  computed: {
    isEdit() {
      return this.project !== null
    }
  },
  watch: {
    project: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form.name = val.name
        } else {
          this.form.name = ''
        }
      }
    }
  },
  methods: {
    submit() {
      if (!this.form.name.trim()) return
      this.$emit('submit', { name: this.form.name.trim() })
      this.form.name = ''
    }
  }
}
</script>