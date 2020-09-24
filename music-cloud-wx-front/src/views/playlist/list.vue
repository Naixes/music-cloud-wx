<template>
  <div>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column label="封面" width="100">
        <template slot-scope="scope">
          <img :src="scope.row.picUrl" alt height="50" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="copywriter" label="描述"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="onEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="onDel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 确认删除的对话框 -->
    <el-dialog title="提示" :visible.sync="delDialogVisible" width="30%">
      <span>确定删除该歌单吗</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doDel">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getPlaylist, delPlay } from '@/api/playlist'
import scroll from '@/utils/scroll'

const limit = 12

export default {
  data() {
    return {
      list: [],
      loading:false,
      delId: '',
      delDialogVisible: false
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    scroll.start(this.getList)
  },
  methods: {
    doDel() {
      delPlay({id: this.delId}).then(res => {
        if(res.data.deleted > 0) {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          // 更新页面
          this.list = []
          this.getList()
        }else {
          this.$message.error('删除失败')
        }
        this.delDialogVisible = false
      })
    },
    onEdit(row) {
      this.$router.push(`/playlist/edit/${row._id}`)
    },
    onDel(row) {
      this.delId = row._id
      this.delDialogVisible = true
    },
    getList() {
      this.loading = true
      getPlaylist({
        start: this.list.length,
        limit
      }).then(res => {
        this.list = this.list.concat(res.data)
        if(res.data.length < limit) {
          scroll.end()
        }
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
