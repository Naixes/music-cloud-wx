import request from '@/utils/request'

const baseURL = 'http://localhost:3000'

export function getSwiperlist(params) {
  return request({
    url: `${baseURL}/swiper/list`,
    method: 'get',
    params
  })
}