import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'

interface PicStore {
  dates: string[];
  initDates: (data: string[]) => void;
  datephotos: Record<string, Image.Info[]>;
  initDatesPhotos: (datephotos: Record<string, Image.Info[]>) => void;
  setDatePhotoFeatured: (photo: Image.Info, date: string) => void;

  showPicDrawer: boolean;
  exchangeShowPicDrawer: () => void;

  imageInfo: Image.Info | null; // 使用 null 比空对象更语义化
  setImageInfo: (pic: Image.Info) => void;
  clearMidPic: () => void;
}

export default create<PicStore>()(
  immer((set) => ({

    // 日期
    dates: [],
    initDates: (dates) => set({ dates }),

    // 日期对应的图片
    datephotos: {},
    // 初始化数据
    initDatesPhotos: (datephotos) => set({ datephotos }),
    // 修改某个日期的图片列表，里面的某张图片的属性
    setDatePhotoFeatured: (photo, date) =>
      set((state) => {
        // 确保该日期的图片数组存在
        if (!state.datephotos[date]) return;
        state.datephotos[date] = state.datephotos[date].map(item => ({
          ...item,
          featured: item.fullName === photo.fullName
        }));
      }),

    // 显示 drawer 抽屉
    showPicDrawer: false,
    exchangeShowPicDrawer: () => set((state) => ({ showPicDrawer: !state.showPicDrawer })),

    // 抽屉中显示的图片
    imageInfo: null,
    setImageInfo: (imageInfo) => set({ imageInfo }),
    clearMidPic: () => set({ imageInfo: null }),
  }))
);
