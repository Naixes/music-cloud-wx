<template>
  <div>
    <el-form ref="form" :model="info" label-width="80px">
      <el-form-item label="歌单名称">
        <el-input v-model="info.name" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="info.copywriter" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">更新</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getPlayDetail, editPlay } from '@/api/playlist'
export default {
  props: {
    id: {
      type: String
    }
  },
  data() {
    return {
      info: {}
    }
  },
  created() {
    getPlayDetail({ id: this.id }).then(res => {
      this.info = res.data
    })
  },
  methods: {
    onSubmit() {
      const params = {
        id: this.id,
        name: this.info.name,
        copywriter: this.info.copywriter
      }
      editPlay(params).then(res => {
        // console.log(res);
        if(res.data.modified > 0) {
          this.$message({
            message: '更新成功',
            type: 'success'
          })
        }else {
          this.$message.error('更新失败')
        }
        this.$router.go(-1)
      })
    },
    onCancel() {
        this.$router.go(-1)
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
