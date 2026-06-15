import React from "react";
import { Check } from "lucide-react";

interface PrintContractDocProps {
  lang: "kh" | "en" | "zh";
}

export const PrintContractDoc: React.FC<PrintContractDocProps> = ({ lang }) => {
  const isKh = lang === "kh";
  const isZh = lang === "zh";
  const isEn = lang === "en";

  // localized header texts
  const titles = {
    kh: {
      country: "ព្រះរាជាណាចក្រកម្ពុជា",
      motto: "ជាតិ សាសនា ព្រះមហាក្សត្រ",
      mainTitle: "កិច្ចសន្យាជួលរថយន្ត",
      subPrompt: "កិច្ចសន្យា នេះ ត្រូវបានធ្វើឡើងនៅថ្ងៃទី ..../..../.... រវាងគូភាគីដូចខាងក្រោម៖",
      partA: "ភាគី (ក)៖ ម្ចាស់រថយន្ត (ម្ចាស់ផ្ទាល់)",
      partB: "ភាគី (ខ)៖ អ្នកជួលរថយន្ត",
      fullName: "ឈ្មោះពេញ៖",
      gender: "ភេទ៖",
      male: "ប្រុស",
      female: "ស្រី",
      age: "អាយុ៖",
      years: "ឆ្នាំ",
      nationality: "សញ្ជាតិ៖",
      nationalId: "អត្តសញ្ញាណប័ណ្ណ",
      passport: "លិខិតឆ្លងដែន",
      number: "លេខ៖",
      ownerOfCar: "ត្រូវជាម្ចាស់កម្មសិទ្ធិស្របច្បាប់លើរថយន្ត៖",
      carBrand: "ម៉ាក៖",
      carColor: "ពណ៌៖",
      carYear: "ឆ្នាំផលិត៖",
      carPlate: "ស្លាកលេខ៖",
      carFrame: "លេខតួ៖",
      carEngine: "លេខម៉ាស៊ីន៖",
      partAShort: "ចាប់ពីពេលនេះតទៅហៅកាត់ថា «ភាគី (ក)»",
      partBShort: "ចាប់ពីពេលនេះតទៅហៅកាត់ថា «ភាគី (ខ)»",
      agreeStmt: "គូភាគីទាំងពីរបានព្រមព្រៀងគ្នាខ្ជាប់ខ្ជួនលើលក្ខខណ្ឌនានាដូចខាងក្រោម៖",
    },
    en: {
      country: "KINGDOM OF CAMBODIA",
      motto: "NATION • RELIGION • KING",
      mainTitle: "CAR RENTAL LEASE AGREEMENT",
      subPrompt: "This agreement is made and executed on Date: ..../..../2026 by and between:",
      partA: "PARTY (A): VEHICLE OWNER (LESSOR)",
      partB: "PARTY (B): VEHICLE RENTER (LESSEE)",
      fullName: "Full Name:",
      gender: "Gender:",
      male: "Male",
      female: "Female",
      age: "Age:",
      years: "years old",
      nationality: "Nationality:",
      nationalId: "National ID Card",
      passport: "Passport",
      number: "No:",
      ownerOfCar: "The sole designated legal owner of the vehicle specified below:",
      carBrand: "Model/Brand:",
      carColor: "Color:",
      carYear: "Year:",
      carPlate: "Plate No:",
      carFrame: "Frame (VIN) No:",
      carEngine: "Engine No:",
      partAShort: "Hereinafter referred to as 'Party (A)'",
      partBShort: "Hereinafter referred to as 'Party (B)'",
      agreeStmt: "Both parties have mutually agreed to fulfill the specific articles below:",
    },
    zh: {
      country: "柬埔寨王国",
      motto: "民族 • 宗教 • 国王",
      mainTitle: "汽 车 租 赁 合 同",
      subPrompt: "本合同由以下双方于 2026年....月....日 自愿签署：",
      partA: "甲方（出借方）：车辆合法所有人 (Lessor)",
      partB: "乙方（承租方）：车辆承租人 (Lessee)",
      fullName: "姓名 / 公司名称:",
      gender: "性别:",
      male: "男",
      female: "女",
      age: "年龄:",
      years: "岁",
      nationality: "国籍:",
      nationalId: "身份证号",
      passport: "护照号",
      number: "证件号码:",
      ownerOfCar: "以下经核准并享有完全所有权的租赁车辆细节：",
      carBrand: "车辆品牌/型号:",
      carColor: "车辆颜色:",
      carYear: "生产年份:",
      carPlate: "车牌号码:",
      carFrame: "车架号 (VIN):",
      carEngine: "发动机号:",
      partAShort: "以下简称“甲方”",
      partBShort: "以下简称“乙方”",
      agreeStmt: "甲乙双方经友好协商，就上述车辆租赁事宜自愿达成如下协议条款：",
    }
  };

  const currentHeader = titles[lang];

  return (
    <div id="khmer-printable-contract" className="w-full bg-white text-stone-900 select-text font-khmer">
      
      {/* PAGE 1 */}
      <div className="print-pdf-page pdf-page bg-white text-stone-900 border border-stone-200 p-8 sm:p-14 w-full text-left relative overflow-hidden flex flex-col justify-between" style={{ minHeight: "1123px" }}>
        <div>
          {/* Header Seals */}
          <div className="flex flex-col items-center text-center mb-6">
            <h3 className="font-bold text-xs sm:text-sm tracking-widest uppercase text-stone-900 leading-normal block">
              {currentHeader.country}
            </h3>
            <p className="text-[10px] sm:text-xs text-stone-605 mt-1 block font-medium">
              {currentHeader.motto}
            </p>
            
            {/* Cambodia Emblem Symbol decoration */}
            <div className="flex items-center gap-1.5 justify-center py-2.5">
              <span className="w-2.5 h-[1.5px] bg-stone-300" />
              <span className="text-[9px] text-stone-400 font-bold tracking-widest font-mono">ENTER CAR RENTAL</span>
              <span className="w-2.5 h-[1.5px] bg-stone-300" />
            </div>

            <h1 className="text-sm sm:text-base font-extrabold text-[#4C0027] tracking-wider mt-2 uppercase font-khmer-moul">
              {currentHeader.mainTitle}
            </h1>
            <div className="w-full border-b-[3px] border-[#4C0027] mt-3" />
          </div>

          {/* Sub-header prompt */}
          <p className="text-[12px] sm:text-sm leading-relaxed text-stone-800 mb-6 font-semibold">
            {currentHeader.subPrompt}
          </p>

          {/* SECTION A: Party A */}
          <div className="border border-stone-300 rounded-xl overflow-hidden mb-6 bg-stone-50/50 shadow-xs">
            <div className="bg-[#4C0027]/10 px-4 py-2.5 border-b border-stone-200 flex justify-between items-center">
              <h4 className="font-khmer-moul text-xs sm:text-sm text-[#4C0027] font-semibold flex items-center gap-2">
                <span className="text-[10px] w-5 h-5 bg-[#4C0027] text-white flex items-center justify-center rounded-full font-sans font-bold">ក</span>
                {currentHeader.partA}
              </h4>
            </div>
            <div className="p-4 sm:p-5 text-xs sm:text-[13px] leading-8 text-stone-800 flex flex-col gap-3">
              <div>
                {currentHeader.fullName} <span className="font-mono tracking-widest text-stone-400">...........................................................................................................</span>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <div className="flex items-center gap-2">
                  {currentHeader.gender} 
                  <span className="inline-flex items-center gap-1.5 ml-1"><span className="w-3.5 h-3.5 border border-stone-400 rounded-xs inline-block" /> {currentHeader.male}</span>
                  <span className="inline-flex items-center gap-1.5 ml-4"><span className="w-3.5 h-3.5 border border-stone-400 rounded-xs inline-block" /> {currentHeader.female}</span>
                </div>
                <div>
                  {currentHeader.age} <span className="font-mono text-stone-400">..........</span> {currentHeader.years}
                </div>
                <div>
                  {currentHeader.nationality} <span className="font-bold">{isKh ? "ខ្មែរ" : isZh ? "柬埔寨国籍" : "Cambodian"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 bg-[#4C0027] text-white flex items-center justify-center rounded-sm"><Check className="w-3 h-3 text-amber-400" /></span>
                  {currentHeader.nationalId}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 border border-stone-400 rounded-sm inline-block" />
                  {currentHeader.passport}
                </div>
                <div className="flex-1">
                  {currentHeader.number} <span className="font-mono tracking-widest text-stone-400">...........................................................................................................</span>
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-stone-200/80">
                <span className="font-semibold text-stone-900 block mb-1">{currentHeader.ownerOfCar}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <div>{currentHeader.carBrand} <span className="font-mono tracking-widest text-stone-400">..................................................</span></div>
                  <div>{currentHeader.carColor} <span className="font-mono tracking-widest text-stone-400">..................................................</span></div>
                  <div>{currentHeader.carYear} <span className="font-mono tracking-widest text-stone-400">...............................................</span></div>
                  <div>{currentHeader.carPlate} <span className="font-mono tracking-widest text-stone-400">.............................................</span></div>
                  <div>{currentHeader.carFrame} <span className="font-mono tracking-widest text-stone-400">...............................................</span></div>
                  <div>{currentHeader.carEngine} <span className="font-mono tracking-widest text-stone-400">............................................</span></div>
                </div>
              </div>

              <div className="text-right mt-1.5 font-mono text-[10px] text-stone-500 italic block">
                {currentHeader.partAShort}
              </div>
            </div>
          </div>

          {/* SECTION B: Party B */}
          <div className="border border-stone-300 rounded-xl overflow-hidden mb-6 bg-stone-50/50 shadow-xs">
            <div className="bg-[#4C0027]/10 px-4 py-2.5 border-b border-stone-200 flex justify-between items-center">
              <h4 className="font-khmer-moul text-xs sm:text-sm text-[#4C0027] font-semibold flex items-center gap-2">
                <span className="text-[10px] w-5 h-5 bg-[#4C0027] text-white flex items-center justify-center rounded-full font-sans font-bold">ខ</span>
                {currentHeader.partB}
              </h4>
            </div>
            <div className="p-4 sm:p-5 text-xs sm:text-[13px] leading-8 text-stone-800 flex flex-col gap-3">
              <div>
                {currentHeader.fullName} <span className="font-mono tracking-widest text-stone-400">...........................................................................................................</span>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <div className="flex items-center gap-2">
                  {currentHeader.gender} 
                  <span className="inline-flex items-center gap-1.5 ml-1"><span className="w-3.5 h-3.5 border border-stone-400 rounded-xs inline-block" /> {currentHeader.male}</span>
                  <span className="inline-flex items-center gap-1.5 ml-4"><span className="w-3.5 h-3.5 border border-stone-400 rounded-xs inline-block" /> {currentHeader.female}</span>
                </div>
                <div>
                  {currentHeader.age} <span className="font-mono text-stone-400">..........</span> {currentHeader.years}
                </div>
                <div>
                  {currentHeader.nationality} <span className="font-bold">{isKh ? "បរទេស" : "Foreigner"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 border border-stone-400 rounded-sm inline-block" />
                  {currentHeader.nationalId}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 bg-[#4C0027] text-white flex items-center justify-center rounded-sm"><Check className="w-3 h-3 text-amber-400" /></span>
                  {currentHeader.passport}
                </div>
                <div className="flex-1">
                  {currentHeader.number} <span className="font-mono tracking-widest text-stone-400">...........................................................................................................</span>
                </div>
              </div>

              <div className="text-right mt-1.5 font-mono text-[10px] text-stone-500 italic block">
                {currentHeader.partBShort}
              </div>
            </div>
          </div>

          <p className="text-[11px] sm:text-[13px] text-stone-900 font-bold mb-5 italic border-l-4 border-[#4C0027] pl-3">
            {currentHeader.agreeStmt}
          </p>

          {/* TERMS LAYOUT ON PAGE 1 */}
          <div className="flex flex-col gap-4 text-xs sm:text-[13px] leading-relaxed text-stone-800">
            {isKh && (
              <>
                <div>
                  <h5 className="font-bold text-stone-900 font-khmer-moul text-xs sm:text-sm mb-1 text-[#4C0027]">
                    ប្រការ 1៖ កម្មវត្ថុនៃការជួល
                  </h5>
                  <p className="pl-4">
                    ភាគី (ក) យល់ព្រមជួល ហើយភាគី (ខ) យល់ព្រមជួលរថយន្តដែលបានកំណត់អត្តសញ្ញាណក្នុងចំណុចខាងលើ ដែលជាកម្មសិទ្ធិស្របច្បាប់របស់ភាគី (ក)។
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 font-khmer-moul text-xs sm:text-sm mb-1 text-[#4C0027]">
                    ប្រការ 2៖ គោលបំណងនៃការប្រើប្រាស់
                  </h5>
                </div>
              </>
            )}
            {isEn && (
              <>
                <div>
                  <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1 tracking-wide">
                    ARTICLE 1: OBJECT OF THE LEASE
                  </h5>
                  <p className="pl-4">
                    Party (A) agrees to lease, and Party (B) agrees to rent the vehicle identified with the descriptive specifications above, legally registered and owned by Party (A).
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1 tracking-wide">
                    ARTICLE 2: PURPOSE OF VEHICLE USE
                  </h5>
                </div>
              </>
            )}
            {isZh && (
              <>
                <div>
                  <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1">
                    第一条：租赁标的 & 合法所有权
                  </h5>
                  <p className="pl-4">
                    甲方同意出租、乙方同意承租上述具有完全合法所有权且已核准登记参数的汽车设备。
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1">
                    第二条：车辆具体使用目的
                  </h5>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Page Number footer */}
        <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-[10px] text-stone-400 font-bold uppercase tracking-widest">
          {isKh ? "ទំព័រទី ១ / ៣" : isZh ? "第 1 页 / 共 3 页" : "Page 1 of 3"}
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="print-pdf-page pdf-page bg-white text-stone-900 border border-stone-200 p-8 sm:p-14 w-full text-left relative overflow-hidden flex flex-col justify-between" style={{ minHeight: "1123px" }}>
        <div className="flex flex-col gap-5 text-xs sm:text-[13px] leading-relaxed text-stone-800 pt-4">
          
          {isKh && (
            <>
              <p className="pl-4">
                ភាគី (ខ) ជួលរថយន្តនេះ ដើម្បីប្រើប្រាស់ក្នុងគោលបំណង៖ <span className="font-bold text-stone-900">ដំណើរការកម្សាន្តលក្ខណៈគ្រួសារ</span>។ ភាគី (ខ) មិនអាចយករថយន្តនេះ ទៅធ្វើអាជីវកម្ម ឬប្រើប្រាស់ក្រៅពីគោលបំណងខាងលើបានឡើយ លុះត្រាតែមានការយល់ព្រមជាលាយលក្ខណ៍អក្សរជាមុនពីភាគី (ក)។
              </p>
              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 3៖ រយៈពេលនៃកិច្ចសន្យា
                </h5>
                <p className="pl-4">
                  កិច្ចសន្យានេះមានសុពលភាពរយៈពេល <span className="font-bold text-stone-900 border-b border-stone-900 pb-0.5 px-3">1 ខែ</span> ដោយគិតចាប់ពីថ្ងៃទី <span className="font-bold text-[#4C0027] font-mono">20/06/2026</span> រហូតដល់ថ្ងៃទី <span className="font-bold text-[#4C0027] font-mono">20/07/2026</span> ។
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 4៖ ថ្លៃជួលរថយន្ត
                </h5>
                <p className="pl-4 leading-8">
                  ថ្លៃជួលរថយន្តនេះ ត្រូវបានកំណត់ចំនួន <span className="font-mono text-stone-400">........................</span> ដុល្លារអាមេរិក (USD) ក្នុងមួយខែ (ឬក្នុងមួយថ្ងៃ)។
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 5៖ ប្រាក់កក់
                </h5>
                <p className="pl-4 leading-7">
                  ភាគី (ខ) ត្រូវប្រគល់ប្រាក់កក់ចំនួន <span className="font-mono text-stone-400">........................</span> ដុល្លារអាមេរិក (USD) ជូនភាគី (ក) នៅពេលចុះកិច្ចសន្យានេះ។ ប្រាក់កក់នេះ នឹងត្រូវប្រើប្រាស់ដើម្បីទូទាត់រាល់ការខូចខាតទាំងឡាយដែលបង្កឡើងដោយចេតនា ឬអចេតនាដោយទង្វើរបស់ភាគី (ខ) ក្នុងអំឡុងពេលជួល។ ប្រាក់កក់នេះ នឹងត្រូវប្រគល់ជូនភាគី (ខ) វិញទាំងស្រុង ក្រោយពេលបញ្ចប់កិច្ចសន្យា និងបន្ទាប់ពីការពិនិត្យឃើញថារថយន្តគ្មានការខូចខាត។ ករណីភាគី (ខ) បញ្ឈប់កិច្ចសន្យាមុនកំណត់ ប្រាក់កក់នេះ នឹងត្រូវរឹបអូសដោយស្វ័យប្រវត្តដោយភាគី (ក)។
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 6៖ របៀបនៃការបង់ប្រាក់
                </h5>
                <p className="pl-4 leading-8">
                  ភាគី (ខ) ត្រូវបង់ប្រាក់ឈ្នួលជួលរថយន្តឱ្យបានទៀងទាត់ជាប្រចាំខែ ដោយត្រូវបង់ជូនភាគី (ក) នៅរៀងរាល់ថ្ងៃទី <span className="font-mono text-stone-400">...........</span> នៃខែនីមួយៗ។
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 7៖ ការហាមឃាត់ការជួលបន្ត
                </h5>
                <p className="pl-4">
                  ភាគី (ខ) មិនអាចយករថយន្តដែលជួលពីភាគី (ក) ទៅជួលបន្ត ធ្វើអាជីវកម្មបន្ត ឬផ្ទេរការប្រើប្រាស់ទៅឱ្យតតិយជន (ជនទីបី) ដោយគ្មានការអនុញ្ញាតជាលាយលក្ខណ៍អក្សរពីភាគី (ក) ដែលជាម្ចាស់រថយន្តឡើយ។
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 8៖ ការទទួលខុសត្រូវចំពោះមុខច្បាប់
                </h5>
                <p className="pl-4">
                  ក្នុងករណីភាគី (ខ) ប្រព្រឹត្តសកម្មភាពល្មើសច្បាប់ណាមួយដោយប្រើប្រាស់រថយន្តជួលនេះ ក្នុងអំឡុងពេលជួល ភាគី (ខ) ត្រូវទទួលខុសត្រូវចំពោះមុខច្បាប់តែម្នាក់ឯងគត់ ដោយមិនពាក់ព័ន្ធនឹងភាគី (ក) ឡើយ។ ភាគី (ក) មិនទទួលខុសត្រូវរាល់ការខូចខាត ឬការបាត់បង់ណាមួយដែលកើតចេញពីការប្រើប្រាស់រថយន្តរបស់ភាគី (ខ) ឡើយ។
                </p>
              </div>
            </>
          )}

          {isEn && (
            <>
              <p className="pl-4">
                Party (B) leases the vehicle specifically for: <span className="font-bold text-stone-900">Family Leisure, Tour Packages, and Road Trip Vacations</span>. Party (B) is strictly prohibited from utilizing the vehicle for commercial logistics, ride-hailing services, or public taxi transport, unless explicit written consent is secured from Party (A).
              </p>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 3: LEASE DURATION
                </h5>
                <p className="pl-4">
                  This lease agreement shall remain valid for a standard duration of <span className="font-bold text-stone-900 border-b border-stone-900 pb-0.5 px-3">1 Month</span>, taking effect from date <span className="font-bold text-[#4C0027] font-mono">20/06/2026</span> up to and including termination date <span className="font-bold text-[#4C0027] font-mono">20/07/2026</span>.
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 4: RENTAL FEE STRUCTURE
                </h5>
                <p className="pl-4 leading-8">
                  The standard lease fee for the vehicle is set at <span className="font-mono text-stone-400">........................</span> USD per calendar month (or per operating day).
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 5: REFUNDABLE SECURITY DEPOSIT
                </h5>
                <p className="pl-4 leading-6">
                  Party (B) must deliver a security deposit totaling <span className="font-mono text-stone-400">........................</span> USD to Party (A) upon execution of this contract. This deposit guards against any intentional, unintentional, or negligent damage caused to the vehicle. It is fully refunded to Party (B) within 7 days of contract end, following a complete vehicle inspection. Early termination of this lease agreement by Party (B) will result in standard forfeiture of the security deposit.
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 6: BILLING SCHEDULE
                </h5>
                <p className="pl-4 leading-8">
                  Party (B) agrees to deposit the monthly lease payment regularly to Party (A) in advance, due on or before the <span className="font-mono text-stone-400">...........</span> day of each billing cycle.
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 7: SUB-LEASE RESTRICTION
                </h5>
                <p className="pl-4">
                  Party (B) is strictly forbidden from sub-leasing, renting, lending, or transferring control of the vehicle to any third-party individual or company under any circumstances, without direct prior written consent by Party (A).
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 8: COMPLIANCE WITH THE LAW
                </h5>
                <p className="pl-4">
                  Any traffic violations, illegal cargo holding, or regulatory breaches involving the lease vehicle are the sole liability of Party (B). Party (A) stands fully immune and shall not be held liable for any damages or legal actions arising from Party (B)'s daily operation.
                </p>
              </div>
            </>
          )}

          {isZh && (
            <>
              <p className="pl-4">
                乙方承租车辆特定限定目的为：<span className="font-bold text-stone-900">家庭娱乐休闲与旅游度假出行</span>。未经甲方事前正式书面许可，乙方严禁将车辆转作货运卡车、商业物流、网约营运或出租车行业，否则甲方有权索取全额违约罚金。
              </p>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第三条：租赁期限约定
                </h5>
                <p className="pl-4">
                  本租赁合同有效服务期设定为固定 <span className="font-bold text-stone-900 border-b border-stone-900 pb-0.5 px-3">1 个月</span>，自公历 <span className="font-bold text-[#4C0027] font-mono">2026/06/20</span> 起，至终止日 <span className="font-bold text-[#4C0027] font-mono">2026/07/20</span> 止。
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第四条：汽车租金标准
                </h5>
                <p className="pl-4 leading-8">
                  上述车辆月租费（或日租费）标准固定为人民币 / 美元 <span className="font-mono text-stone-400">........................</span> 元（以实签标箱货币为准）。
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第五条：车辆履约保证金（押金）
                </h5>
                <p className="pl-4 leading-6">
                  乙方应于本合同签约之日向甲方一次性付清履约押金共计 <span className="font-mono text-stone-400">........................</span> 美元。此押金专项用于充抵租赁期间非自然损耗造成的碰车损坏赔款。合同期满、按规定完好退还车后 7 个工作日内，甲方应将押金原额全额退回乙方。若乙方私自提前终止合同，此押金不予退还，属自动充公甲方违约金。
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第六条：月度租金缴付周期
                </h5>
                <p className="pl-4 leading-8">
                  乙方须每期提前交纳租金。每次划算周期之交租截止日期固定为每月的 <span className="font-mono text-stone-400">...........</span> 号。
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第七条：严禁私自转租或转借
                </h5>
                <p className="pl-4">
                  乙方在租期内拥有支配使用权，但绝对禁止在未经甲方书面立项许可前，将租车转租、外借或有偿移送予任何第三方使用。
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第八条：自主履约法律免责
                </h5>
                <p className="pl-4">
                  乙方在驾驶车辆租期中发生任何治安拘留、违章扣分、刑事犯罪或运输涉毒走私等纠纷，由乙方承揽全部行政及刑事责任，一概与出车人甲方无涉。
                </p>
              </div>
            </>
          )}

        </div>

        {/* Page Number footer */}
        <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-[10px] text-stone-400 font-bold uppercase tracking-widest">
          {isKh ? "ទំព័រទី ២ / ៣" : isZh ? "第 2 页 / 共 3 页" : "Page 2 of 3"}
        </div>
      </div>

      {/* PAGE 3 */}
      <div className="print-pdf-page pdf-page bg-white text-stone-900 border border-stone-200 p-8 sm:p-14 w-full text-left relative overflow-hidden flex flex-col justify-between" style={{ minHeight: "1123px" }}>
        <div className="flex flex-col gap-5 text-xs sm:text-[13px] leading-relaxed text-stone-800 pt-4">
          
          {isKh && (
            <>
              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 9៖ ករណីខូចខាតរថយន្ត
                </h5>
                <div className="pl-4 flex flex-col gap-2.5">
                  <p>
                    <span className="font-bold text-stone-900">9.1៖</span> ករណីរថយន្តមានការខូចខាតតិចតួច ឬធ្ងន់ធ្ងរ ដោយសារការប្រើប្រាស់ធ្វេសប្រហែស ឬកំហុសរបស់ភាគី (ខ) ការចំណាយលើការជួសជុលជាបន្ទុករបស់ភាគី (ខ) ទាំងស្រុង។ លើកលែងតែការសឹករិល ឬការខូចខាតដោយសារកត្តាប្រើប្រាស់ធម្មជាតិ (Wear and Tear) ទើបជាបន្ទុករបស់ភាគី (ក)។
                  </p>
                  <p>
                    <span className="font-bold text-stone-900">9.2៖</span> ភាគី (ខ) ត្រូវទទួលខុសត្រូវទាំងស្រុងលើករណីរថយន្តខូចខាតធ្ងន់ធ្ងរ (ដូចជា បុក ក្រឡាប់ ធ្លាក់ទឹក ចោរលួច ឆេះ ឬឧប្បត្តិហេតុផ្សេងៗ) ដោយត្រូវសងសំណងតាមការព្រមព្រៀងគ្នាស្មើនឹង <span className="font-bold underline text-[#4C0027] decoration-amber-500 decoration-2">តាមតម្លៃទីផ្សារជាក់ស្តែង</span> ជូនភាគី (ក)។
                  </p>
                  <p>
                    <span className="font-bold text-stone-900">9.3៖</span> ករណីភាគី (ខ) ប្រើប្រាស់រថយន្តមានការប៉ះទង្គិច ឬឆ្កូត ត្រូវតែជូនដំណឹងដល់ភាគី (ក) ជាបន្ទាន់។ មិនអនុញ្ញាតឱ្យភាគី (ខ) លាក់បាំងព័ត៌មាន រួចយកថយន្តទៅជួសជុលដោយគ្មានការឯកភាពពីភាគី (ក) ឡើយ។
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 10៖ ការធានាខុសត្រូវរដ្ឋប្បវេណី និងព្រហ្មទណ្ឌ
                </h5>
                <p className="pl-4">
                  រាល់ការខូចខាត ឬគ្រោះថ្នាក់ចរាចរណ៍ ការដឹកជញ្ជូនទំនិញខុសច្បាប់ ការរត់ពន្ធ ឬសកម្មភាពខុសច្បាប់ផ្សេងៗទៀតដែលកើតឡើងក្នុងអំឡុងពេលជួលនេះ ភាគី (ខ) ត្រូវទទួលខុសត្រូវទាំងស្រុងចំពោះមុខច្បាប់ទាំងផ្នែកព្រហ្មទណ្ឌ និងរដ្ឋប្បវេណី។
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 11៖ ការរំលាយកិច្ចសន្យា
                </h5>
                <p className="pl-4">
                  ករណីភាគី (ខ) មិនអនុវត្តកាតព្វកិច្ចបង់ប្រាក់ឈ្នួល ឬបង់ប្រាក់យឺតយ៉ាវលើសពី 7 (ប្រាំពីរ) ថ្ងៃ ឬរំលោភលើខសន្យាណាមួយ ភាគី (ក) មានសិទ្ធិរំលាយកិច្ចសន្យានេះភ្លាមៗ ព្រមទាំងមានសិទ្ធិដកហូតយករថយន្តមកវិញនៅគ្រប់ពេលវេលា ដោយមិនបាច់ជូនដំណឹងជាមុន និងមិនបង្វិលប្រាក់កក់។
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 12៖ ដែនកំណត់នៃការប្រើប្រាស់
                </h5>
                <p className="pl-4 leading-8">
                  រថយន្តជួលក្នុងកិច្ចសន្យានេះ អនុញ្ញាតឱ្យភាគី (ខ) ប្រើប្រាស់ក្នុងតំបន់/បរិវេណ៖ <span className="font-mono text-stone-400">.....................................................</span> ។ ករណីភាគី (ខ) ចង់ប្រើប្រាស់ក្រៅតំបន់ ឬឆ្លងទៅបណ្តាខេត្តផ្សេងៗ ត្រូវជូនដំណឹងសុំការអនុញ្ញាតពីភាគី (ក) ជាមុន ហើយភាគី (ខ) ត្រូវទទួលខុសត្រូវរាល់ការចំណាយ និងហានិភ័យទាំងស្រុង។
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                  ប្រការ 13៖ ភាពស្មោះត្រង់ និងការកែប្រែកិច្ចសន្យា
                </h5>
                <p className="pl-4">
                  កិច្ចសន្យានេះត្រូវបានធ្វើឡើងដោយការព្រមព្រៀងគ្នានិងស្ម័គ្រចិត្ត។ រាល់ការកែប្រែកុងត្រាត្រូវព្រមព្រៀងជាលាយលក្ខណ៍អក្សរទើបមានប្រសិទ្ធភាព។
                </p>
              </div>
            </>
          )}

          {isEn && (
            <>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 9: VEHICLE DAMAGE & ASSESSMENTS
                </h5>
                <div className="pl-4 flex flex-col gap-2">
                  <p>
                    <span className="font-bold text-stone-900">9.1:</span> In the event of minor or major damage arising from negligence, the repair shall be fully funded by Party (B). Standard wear and tear by aged natural factors of engine is under responsibility of Party (A).
                  </p>
                  <p>
                    <span className="font-bold text-stone-900">9.2:</span> Party (B) is fully liable in cases of complete vehicle loss, severe accidents, rollover, submersion, theft, or fire. Compensation must be delivered to Party (A) based on <span className="font-bold text-[#4C0027] underline">actual current fair market valuation</span>.
                  </p>
                  <p>
                    <span className="font-bold text-stone-900">9.3:</span> Any bumps or scratches must be registered with Party (A) immediately. Unsanctioned repairs without Party (A) consent are strictly ground for breach of terms.
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 10: CRIMINAL & CIVIL LIABILITY IMMUNITY
                </h5>
                <p className="pl-4">
                  Lessee shall maintain absolute individual civil and criminal responsibility for car crash casualties, property damage, and carriage of prohibited illicit materials.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 11: BREACH & TERMINATION
                </h5>
                <p className="pl-4">
                  If Party (B) lags in rental payments by more than 7 running calendar days, or defaults on any condition, Party (A) holds absolute authority to repossess the vehicle immediately and seize the deposit.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 12: ROAD BOUNDARY LIMITS
                </h5>
                <p className="pl-4 leading-8">
                  The lease vehicle is permitted for travel inside boundary: <span className="font-mono text-stone-400">.....................................................</span>. Crossing standard provincial territories requires prior notification to Party (A).
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5 tracking-wide">
                  ARTICLE 13: MUTUAL GOOD FAITH & COOPERATIONS
                </h5>
                <p className="pl-4">
                  This lease is made under voluntary terms in mutual good faith. Any alterations can only be executed via written and fully executed revision covenants.
                </p>
              </div>
            </>
          )}

          {isZh && (
            <>
              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第九条：车辆损坏赔偿机制
                </h5>
                <div className="pl-4 flex flex-col gap-2">
                  <p>
                    <span className="font-bold text-stone-900">9.1:</span> 因乙方不当或非法操控所致的一般故障维护，修理费用全部归乙方承担。正常机动件折旧与定期保养属甲方责任。
                  </p>
                  <p>
                    <span className="font-bold text-stone-900">9.2:</span> 凡遭遇倾覆、报废、沉水、火灾事故，乙方必须无条件按照<span className="font-bold text-[#4C0027] underline">二手汽车市场评估真实行情</span>向甲方提供等值全款退赔。
                  </p>
                  <p>
                    <span className="font-bold text-stone-900">9.3:</span> 任何事故剐蹭必须第一时间上报甲方协同处理，严禁承租方对涉案损坏私拆暗补隐瞒返修。
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第十条：刑事安全和民事全权隔离
                </h5>
                <p className="pl-4">
                  乙方若发生任何违反交通条例、碰撞伤人或装卸违禁物资活动，全部法律责任均由乙方个人独担。
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第十一条：违约清算与收车权柄
                </h5>
                <p className="pl-4">
                  乙方延拖给付期金达 7 天，或不遵守安全条款，主人甲方有权不宣收回租用车辆，无需事前退卡退押。
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第十二条：车辆可驾驶范围商榷
                </h5>
                <p className="pl-4 leading-8">
                  本汽车运行仅限在此周边范围：<span className="font-mono text-stone-400">.....................................................</span>。擅自驾车离境、跨省必须通过书面申请并买单关联险种。
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#4C0027] text-xs sm:text-sm mb-1.5">
                  第十三条：诚信原则与补充条款
                </h5>
                <p className="pl-4">
                  本合同是在双方出于最高商业忠实、自愿平等的背景下达成。一切关于合同要件的协商修订均需提供书面协议支持。
                </p>
              </div>
            </>
          )}

          {/* Signing Date block right-aligned */}
          <div className="text-right font-semibold text-stone-900 mt-6 mb-2 pr-10">
            {isKh ? "ធ្វើនៅថ្ងៃទី" : isZh ? "签约日期：" : "Executed on Date:"} <span className="font-mono text-stone-400">..../..../2026</span>
          </div>

          {/* SIGNATURE COLUMNS */}
          <div className="grid grid-cols-3 gap-6 text-center mt-6 pt-4 border-t border-stone-200">
            {/* Column 1: Party A */}
            <div className="flex flex-col items-center">
              <span className="font-bold text-stone-900 text-[11px] sm:text-[13px] leading-relaxed block">
                {isKh ? "ភាគី (ក) / ម្ចាស់រថយន្ត" : isZh ? "甲方 (签字盖章)" : "Party (A) / Lessor"}
              </span>
              <span className="text-[10px] text-stone-400 italic block mt-1">
                {isKh ? "(ហត្ថលេខា ឬ ស្នាមមេដៃ)" : isZh ? "(签名或印信)" : "(Signature or Thumb Print)"}
              </span>
              <div className="h-14" />
              <span className="text-[11px] text-stone-700 block font-mono">
                {isKh ? "ឈ្មោះ ៖ ....................." : isZh ? "名 称 ៖ ....................." : "Name: ....................."}
              </span>
            </div>

            {/* Column 2: Witness */}
            <div className="flex flex-col items-center">
              <span className="font-bold text-stone-900 text-[11px] sm:text-[13px] leading-relaxed block">
                {isKh ? "សាក្សី" : isZh ? "见证人 (签字盖章)" : "Witness / Guarantor"}
              </span>
              <span className="text-[10px] text-stone-400 italic block mt-1">
                {isKh ? "(ហត្ថលេខា ឬ ស្នាមមេដៃ)" : isZh ? "(签名或随行)" : "(Signature)"}
              </span>
              <div className="h-14" />
              <span className="text-[11px] text-stone-700 block font-mono">
                {isKh ? "ឈ្មោះ ៖ ....................." : isZh ? "名 称 ៖ ....................." : "Name: ....................."}
              </span>
            </div>

            {/* Column 3: Party B */}
            <div className="flex flex-col items-center">
              <span className="font-bold text-stone-900 text-[11px] sm:text-[13px] leading-relaxed block">
                {isKh ? "ភាគី (ខ) / អ្នកជួលរថយន្ត" : isZh ? "乙方 (签字按印)" : "Party (B) / Lessee"}
              </span>
              <span className="text-[10px] text-stone-400 italic block mt-1">
                {isKh ? "(ហត្ថលេខា ឬ ស្នាមមេដៃ)" : isZh ? "(签名或印信)" : "(Signature or Thumb Print)"}
              </span>
              <div className="h-14" />
              <span className="text-[11px] text-stone-700 block font-mono">
                {isKh ? "ឈ្មោះ ៖ ....................." : isZh ? "名 称 ៖ ....................." : "Name: ....................."}
              </span>
            </div>
          </div>

        </div>

        {/* Page Number footer */}
        <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-[10px] text-stone-400 font-bold uppercase tracking-widest">
          {isKh ? "ទំព័រទី ៣ / ៣" : isZh ? "第 3 页 / 共 3 页" : "Page 3 of 3"}
        </div>
      </div>

    </div>
  );
};
