import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'

// 导出学生课表为 Excel
export const exportStudentTimetableToExcel = (studentData: any, timetableData: any[]) => {
  const workbook = XLSX.utils.book_new()
  
  // 创建课表数据
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ]
  
  const daysOfWeek = ['时间', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  // 创建表头
  const worksheetData = [
    [`${studentData.name} 的课表`],
    [`年级：${studentData.grade} | 教室：${studentData.classroom}`],
    [],
    daysOfWeek
  ]
  
  // 填充时间段数据
  timeSlots.forEach(timeSlot => {
    const row = [timeSlot]
    
    // 为每一天添加课程信息
    for (let day = 1; day <= 7; day++) {
      const dayData = timetableData.find(d => d.day === day)
      if (dayData) {
        const classes = dayData.classes.filter((cls: any) => {
          const startHour = parseInt(cls.startTime.split(':')[0])
          const slotHour = parseInt(timeSlot.split(':')[0])
          const endHour = parseInt(cls.endTime.split(':')[0])
          return startHour <= slotHour && slotHour < endHour
        })
        
        if (classes.length > 0) {
          const classInfo = classes.map((cls: any) => 
            `${cls.subject}\n${cls.teacher}\n${cls.classroom}\n${cls.startTime}-${cls.endTime}`
          ).join('\n---\n')
          row.push(classInfo)
        } else {
          row.push('')
        }
      } else {
        row.push('')
      }
    }
    
    worksheetData.push(row)
  })
  
  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  
  // 设置列宽
  worksheet['!cols'] = [
    { width: 10 }, // 时间列
    { width: 20 }, // 周一
    { width: 20 }, // 周二
    { width: 20 }, // 周三
    { width: 20 }, // 周四
    { width: 20 }, // 周五
    { width: 20 }, // 周六
    { width: 20 }, // 周日
  ]
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, '课表')
  
  // 导出文件
  XLSX.writeFile(workbook, `${studentData.name}_课表.xlsx`)
}

// 导出教师课表为 Excel
export const exportTeacherTimetableToExcel = (teacherData: any, timetableData: any[]) => {
  const workbook = XLSX.utils.book_new()
  
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ]
  
  const daysOfWeek = ['时间', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  // 创建表头
  const worksheetData = [
    [`${teacherData.name} 的课表`],
    [teacherData.subject ? `主要科目：${teacherData.subject}` : ''],
    [],
    daysOfWeek
  ]
  
  // 填充时间段数据
  timeSlots.forEach(timeSlot => {
    const row = [timeSlot]
    
    // 为每一天添加课程信息
    for (let day = 1; day <= 7; day++) {
      const dayData = timetableData.find(d => d.day === day)
      if (dayData) {
        const classes = dayData.classes.filter((cls: any) => {
          const startHour = parseInt(cls.startTime.split(':')[0])
          const slotHour = parseInt(timeSlot.split(':')[0])
          const endHour = parseInt(cls.endTime.split(':')[0])
          return startHour <= slotHour && slotHour < endHour
        })
        
        if (classes.length > 0) {
          const classInfo = classes.map((cls: any) => 
            `${cls.subject}\n${cls.student} (${cls.studentGrade})\n${cls.classroom}\n${cls.startTime}-${cls.endTime}`
          ).join('\n---\n')
          row.push(classInfo)
        } else {
          row.push('')
        }
      } else {
        row.push('')
      }
    }
    
    worksheetData.push(row)
  })
  
  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  
  // 设置列宽
  worksheet['!cols'] = [
    { width: 10 }, // 时间列
    { width: 25 }, // 周一
    { width: 25 }, // 周二
    { width: 25 }, // 周三
    { width: 25 }, // 周四
    { width: 25 }, // 周五
    { width: 25 }, // 周六
    { width: 25 }, // 周日
  ]
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, '课表')
  
  // 导出文件
  XLSX.writeFile(workbook, `${teacherData.name}_课表.xlsx`)
}

// 导出课表为图片
export const exportTimetableToImage = async (elementId: string, filename: string) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('找不到要导出的元素')
    }
    
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高清晰度
      useCORS: true,
      allowTaint: true,
    })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('导出图片失败:', error)
    throw error
  }
}
