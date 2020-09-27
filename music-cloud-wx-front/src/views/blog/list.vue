<template>
  <div>
    <el-table v-loading="loading" :data="blogList" stripe>
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column prop="content" label="内容"></el-table-column>
      <el-table-column prop="nickName" label="发布人"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="onDel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 确认删除的对话框 -->
    <el-dialog title="提示" :visible.sync="delDialogVisible" width="30%">
      <span>确定删除该博客吗</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doDel">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getBlogList, delBlog } from '@/api/blog'
import scroll from '@/utils/scroll'

export default {
  data() {
    return {
      blogList: [],
      limit: 50,
      delDialogVisible: false,
      loading: false,
      delBlog: {}
    }
  },
  created() {
    this.getList()
  },
  mounted(){
      scroll.start(this.getList)
  },
  methods: {
    getList() {
      this.loading = true
      const params = {
        start: this.blogList.length,
        limit: this.limit
      }
      getBlogList(params).then(res => {
        // console.log(res);
        let _blogList = []
        res.data.forEach(ele => {
          _blogList.push(JSON.parse(ele))
        });
        this.blogList = this.blogList.concat(_blogList)
        if(_blogList.length < this.limit) {
          scroll.end()
        }
        this.loading = false
      })
    },
    onDel(row){
      this.delBlog = row
      this.delDialogVisible = true
    },
    doDel(){
      this.delDialogVisible = false
      this.loading = true
      delBlog(this.delBlog).then(res => {
        // console.log(res);
        this.blogList = []
        this.getList()
          this.$message({
            message: '删除成功',
            type: 'success'
          })
      })
    },
  }
}
</script>

<style>
</style>