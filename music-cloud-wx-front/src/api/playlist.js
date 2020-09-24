import request from '@/utils/request'

const baseURL = 'http://localhost:3000'

export function delPlay(params) {
  return request({
    url: `${baseURL}/playlist/delete`,
    method: 'get',
    params
  })
}
export function editPlay(params) {
  return request({
    url: `${baseURL}/playlist/edit`,
    method: 'post',
    data: {
      ...params
    }
  })
}
export function getPlaylist(params) {
  return request({
    url: `${baseURL}/playlist/list`,
    method: 'get',
    params
  })
}
export function getPlayDetail(params) {
  return request({
    url: `${baseURL}/playlist/detail`,
    method: 'get',
    params
  })
}