import { MenuItem } from './types';

export const MENU_STRUCTURE: MenuItem[] = [
  {
    id: 'home',
    title: 'หน้าหลัก',
    description: 'ภาพรวมระบบรายงานผลการปฏิบัติงาน'
  },
  {
    id: 'challenge',
    title: 'ประเด็นท้าทาย',
    description: 'ข้อตกลงในการพัฒนางานที่เป็นประเด็นท้าทาย'
  },
  {
    id: 'domain-1',
    title: 'ด้านที่ 1 การจัดการเรียนรู้',
    isHeader: true
  },
  { id: 'd1-1', title: '1.1 สร้างและหรือพัฒนาหลักสูตร' },
  { id: 'd1-2', title: '1.2 ออกแบบการจัดการเรียนรู้' },
  { id: 'd1-3', title: '1.3 จัดกิจกรรมการเรียนรู้' },
  { id: 'd1-4', title: '1.4 สร้างและหรือพัฒนาสื่อ นวัตกรรม' },
  { id: 'd1-5', title: '1.5 วัดและประเมินผลการเรียนรู้' },
  { id: 'd1-6', title: '1.6 ศึกษา วิเคราะห์ และสังเคราะห์' },
  { id: 'd1-7', title: '1.7 จัดบรรยากาศที่ส่งเสริมการเรียนรู้' },
  { id: 'd1-8', title: '1.8 อบรมและพัฒนาคุณลักษณะที่ดี' },
  {
    id: 'domain-2',
    title: 'ด้านที่ 2 ส่งเสริมและสนับสนุน',
    isHeader: true
  },
  { id: 'd2-9', title: '2.1 จัดทำข้อมูลสารสนเทศของผู้เรียน' },
  { id: 'd2-10', title: '2.2 ดำเนินการตามระบบดูแลช่วยเหลือ' },
  { id: 'd2-11', title: '2.3 ปฏิบัติงานวิชาการและงานอื่นๆ' },
  { id: 'd2-12', title: '2.4 ประสานความร่วมมือกับผู้ปกครอง' },
  {
    id: 'domain-3',
    title: 'ด้านที่ 3 พัฒนาตนเองและวิชาชีพ',
    isHeader: true
  },
  { id: 'd3-13', title: '3.1 พัฒนาตนเองอย่างเป็นระบบ' },
  { id: 'd3-14', title: '3.2 มีส่วนร่วมแลกเปลี่ยนเรียนรู้' },
  { id: 'd3-15', title: '3.3 นำความรู้มาใช้ในการพัฒนา' },
];

export const USER_PROFILE = {
  name: 'นายอภิชาติ ชุมพล',
  position: 'ครู วิทยฐานะครูชำนาญการพิเศษ',
  school: 'โรงเรียนประจักษ์ศิลปาคม',
  // High-resolution image URL
  imageUrl: 'https://img2.pic.in.th/pic/a9b2a236-4e48-4544-8dd7-42800f4daf67.jpg'
};

export const MOCK_INITIAL_DATA = [
  {
    id: 'mock-1',
    indicator: 'd1-4',
    fileUrl: 'https://picsum.photos/800/600',
    fileType: 'IMAGE',
    uploadDate: new Date().toISOString(),
    caption: 'สื่อการสอน PowerPoint เรื่องพลังงานทดแทน (ตัวอย่าง)',
    thumbnailUrl: 'https://picsum.photos/800/600'
  }
];