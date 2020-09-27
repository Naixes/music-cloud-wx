import request from '@/utils/request'

const baseURL = 'http://localhost:3000'

export function delBlog(params) {
  return request({
    url: `${baseURL}/blog/delete`,
    method: 'post',
    data: {
      ...params
    }
  })
}

export function getBlogList(params) {
  return request({
    url: `${baseURL}/blog/list`,
    method: 'get',
    params
  })
}