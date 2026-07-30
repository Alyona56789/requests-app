<template>
  <v-card class="pa-4 mb-4">
    <v-card-title>
      {{ isEdit ? 'Редактировать заявку' : 'Новая заявка' }}
    </v-card-title>
    <v-card-text>
      <v-text-field
        v-model="form.title"
        label="Название заявки"
        variant="outlined"
        density="compact"
        :rules="[v => !!v || 'Название обязательно']"
      />
      <v-textarea
        v-model="form.description"
        label="Описание"
        variant="outlined"
        density="compact"
        rows="3"
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
  name: 'RequestForm',
  props: {
    request: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      form: {
        title: '',
        description: ''
      }
    }
  },
  computed: {
    isEdit() {
      return this.request !== null
    }
  },
  watch: {
    request: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form.title = val.title || ''
          this.form.description = val.description || ''
        } else {
          this.form.title = ''
          this.form.description = ''
        }
      }
    }
  },
  methods: {
    submit() {
      if (!this.form.title.trim()) return
      this.$emit('submit', {
        title: this.form.title.trim(),
        description: this.form.description.trim()
      })
      this.form.title = ''
      this.form.description = ''
    }
  }
}
</script>