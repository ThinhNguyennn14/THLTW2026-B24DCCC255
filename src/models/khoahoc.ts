import { KhoaHoc } from '../services/QuanLyKhoaHoc/typing';
import { TrangThaiKhoaHoc } from '../services/QuanLyKhoaHoc/constants';

let danhSachKhoaHoc: KhoaHoc[] = [
  {
    id: 'kh1',
    tenKhoaHoc: 'Lập trình Javascript nâng cao',
    giangVien: 'Nguyễn Văn A',
    soLuongHocVien: 150,
    trangThai: TrangThaiKhoaHoc.DANG_MO,
    moTa: '<p>Khóa học cung cấp kiến thức sâu về Javascript.</p>',
  },
  {
    id: 'kh2',
    tenKhoaHoc: 'Lập trình ReactJS',
    giangVien: 'Trần Thị B',
    soLuongHocVien: 250,
    trangThai: TrangThaiKhoaHoc.DANG_MO,
    moTa: '<h1>Học ReactJS từ cơ bản đến nâng cao</h1>',
  },
  {
    id: 'kh3',
    tenKhoaHoc: 'Lập trình NodeJS',
    giangVien: 'Nguyễn Văn A',
    soLuongHocVien: 100,
    trangThai: TrangThaiKhoaHoc.DA_KET_THUC,
    moTa: '<b>Xây dựng backend với NodeJS và Express.</b>',
  },
  {
    id: 'kh4',
    tenKhoaHoc: 'Lập trình Angular',
    giangVien: 'Lê Văn C',
    soLuongHocVien: 0,
    trangThai: TrangThaiKhoaHoc.TAM_DUNG,
    moTa: '<i>Khóa học đang được cập nhật nội dung.</i>',
  },
];

export const danhSachGiangVien = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'];

type SortOrder = 'asc' | 'desc' | undefined;

interface GetCoursesParams {
  searchTerm?: string;
  filterGiangVien?: string;
  filterTrangThai?: TrangThaiKhoaHoc;
  sortBySoLuongHocVien?: SortOrder;
}

class QuanLyKhoaHocService {
  layDanhSachKhoaHoc({
    searchTerm,
    filterGiangVien,
    filterTrangThai,
    sortBySoLuongHocVien,
  }: GetCoursesParams): KhoaHoc[] {
    let ketQua = [...danhSachKhoaHoc];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      ketQua = ketQua.filter(kh =>
        kh.tenKhoaHoc.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (filterGiangVien) {
      ketQua = ketQua.filter(kh => kh.giangVien === filterGiangVien);
    }

    if (filterTrangThai) {
      ketQua = ketQua.filter(kh => kh.trangThai === filterTrangThai);
    }

    if (sortBySoLuongHocVien) {
      ketQua.sort((a, b) => {
        if (sortBySoLuongHocVien === 'asc') {
          return a.soLuongHocVien - b.soLuongHocVien;
        }
        return b.soLuongHocVien - a.soLuongHocVien;
      });
    }

    return ketQua;
  }

  layChiTietKhoaHoc(id: string): KhoaHoc | undefined {
    return danhSachKhoaHoc.find(kh => kh.id === id);
  }

  themKhoaHoc(khoaHocMoi: Omit<KhoaHoc, 'id'>): KhoaHoc {
    if (!khoaHocMoi.tenKhoaHoc || !khoaHocMoi.giangVien) {
      throw new Error('Tên khóa học và giảng viên không được để trống.');
    }

    if (khoaHocMoi.tenKhoaHoc.length > 100) {
      throw new Error('Tên khóa học không được vượt quá 100 ký tự.');
    }

    const isTenKhoaHocExist = danhSachKhoaHoc.some(
      kh =>
        kh.tenKhoaHoc.toLowerCase() ===
        khoaHocMoi.tenKhoaHoc.toLowerCase()
    );

    if (isTenKhoaHocExist) {
      throw new Error('Tên khóa học đã tồn tại.');
    }

    const maxId = danhSachKhoaHoc.reduce((max, kh) => {
      const currentIdNum = parseInt(
        kh.id.replace('kh', ''),
        10
      );
      return currentIdNum > max ? currentIdNum : max;
    }, 0);

    const newId = `kh${maxId + 1}`;

    const newCourse: KhoaHoc = {
      ...khoaHocMoi,
      id: newId,
    };

    danhSachKhoaHoc.push(newCourse);

    return newCourse;
  }

  capNhatKhoaHoc(
    id: string,
    khoaHocCapNhat: Partial<Omit<KhoaHoc, 'id'>>
  ): KhoaHoc {
    const khoaHocIndex = danhSachKhoaHoc.findIndex(
      kh => kh.id === id
    );

    if (khoaHocIndex === -1) {
      throw new Error('Không tìm thấy khóa học để cập nhật.');
    }

    const khoaHocHienTai =
      danhSachKhoaHoc[khoaHocIndex];

    if (khoaHocCapNhat.tenKhoaHoc) {
      if (khoaHocCapNhat.tenKhoaHoc.length > 100) {
        throw new Error(
          'Tên khóa học không được vượt quá 100 ký tự.'
        );
      }

      const isTenKhoaHocExist =
        danhSachKhoaHoc.some(
          kh =>
            kh.id !== id &&
            kh.tenKhoaHoc.toLowerCase() ===
              khoaHocCapNhat.tenKhoaHoc?.toLowerCase()
        );

      if (isTenKhoaHocExist) {
        throw new Error('Tên khóa học đã tồn tại.');
      }
    }

    const updatedCourse = {
      ...khoaHocHienTai,
      ...khoaHocCapNhat,
    };

    danhSachKhoaHoc[khoaHocIndex] =
      updatedCourse;

    return updatedCourse;
  }

  xoaKhoaHoc(id: string): void {
    const khoaHocIndex = danhSachKhoaHoc.findIndex(
      kh => kh.id === id
    );

    if (khoaHocIndex === -1) {
      throw new Error('Không tìm thấy khóa học để xóa.');
    }

    const khoaHoc =
      danhSachKhoaHoc[khoaHocIndex];

    if (khoaHoc.soLuongHocVien > 0) {
      throw new Error(
        'Không thể xóa khóa học đã có học viên.'
      );
    }

    danhSachKhoaHoc.splice(
      khoaHocIndex,
      1
    );
  }
}

export const quanLyKhoaHocService =
  new QuanLyKhoaHocService();