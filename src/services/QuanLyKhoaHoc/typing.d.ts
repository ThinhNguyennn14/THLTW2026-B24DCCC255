import { TrangThaiKhoaHoc } from './constants';

export interface KhoaHoc {
  id: string;
  tenKhoaHoc: string;
  giangVien: string;
  soLuongHocVien: number;
  trangThai: TrangThaiKhoaHoc;
  moTa: string;
}