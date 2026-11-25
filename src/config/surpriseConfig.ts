import { withBaseUrl } from '../utils/videoHelpers';

export interface BirthdayConfig {
  recipientName: string;
  puzzleWord: string;
  puzzleHint: string;
  openingTitle: string;
  openingSubtitle: string;
  openingButtonText: string;
  flowerQuote: string;
  wishes: string[];
  wishesCelebrationText: string;
  envelopeTitle: string;
  envelopeButtonText: string;
  letterGreeting: string;
  letterParagraphs: string[];
  letterClosing: string;
  letterSignature: string;
  footerCredit: string;
  birthdayVideoUrl: string;
  birthdayVideoTitle: string;
  birthdayVideoSubtitle: string;
}

export const SURPRISE_CONFIG: BirthdayConfig = {
  recipientName: "ياسمين",
  puzzleWord: "ياسمين",
  puzzleHint: "إنها زهرةٌ عُرفت برقة جمالها وعطرها الذي لا يُنسى.",
  openingTitle: "أحدهم أعدّ لكِ القليل من السحر خصيصاً لكِ...",
  openingSubtitle: "ادخلي إلى حديقةٍ هادئةٍ تحت ضوء القمر، صُمّمت بالكثير من الدهشة والمحبة.",
  openingButtonText: "اكتشفي مفاجأتكِ ✨",
  flowerQuote: "بعض الأشياء أجمل من أن تكون عادية... تماماً مثلكِ.",
  wishes: [
    "السعادة",
    "السكينة",
    "الحب",
    "ذكرياتٌ جميلة",
    "أحلامٌ تتحقق"
  ],
  wishesCelebrationText: "اليوم، يحتفل العالم باليوم الذي أشرق فيه وجود إنسانةٍ رائعة مثلكِ.",
  envelopeTitle: "وهناك شيءٌ أخير...",
  envelopeButtonText: "افتحي رسالتكِ 💌",
  letterGreeting: "عيد ميلاد سعيد، أيتها الروح الجميلة. 🤍",
  letterParagraphs: [
    "أتمنى أن يحمل لكِ هذا الفصل الجديد من حياتكِ سعادةً لا تنتهي، وأياماً يملؤها السلام، ومفاجآتٍ جميلة، وكل ما تمنّاه قلبكِ يوماً.",
    "عسى أن تجد ابتسامتكِ دائماً سبباً لتُشرق، وأن تهبكِ الحياة ألف لحظةٍ صغيرة تستحق أن تبقى في الذاكرة.",
    "وتماماً مثل زهرة الياسمين هذه، أتمنى لكِ أن تستمري في النمو والتفتح، وأن تجعلي العالم من حولكِ أكثر جمالاً.",
    "اليوم هو يومكِ، فاستمتعي بكل ثانيةٍ فيه."
  ],
  letterClosing: "عيد ميلاد سعيد. ✨🤍",
  letterSignature: "بكل محبتي،",
  footerCredit: "صُنع بالقليل من السحر، لأجلكِ وحدكِ. ♡",
  // ضع رابط فيديو (MP4 أو YouTube) أو مساراً مثل "/birthday-video.mp4" بعد وضعه في مجلد public
  birthdayVideoUrl: withBaseUrl('happybd.mp4'),
  birthdayVideoTitle: "أغنية عيد ميلادٍ خاصة لياسمين 🎬",
  birthdayVideoSubtitle: "لحنٌ خاص وفيديو عيد ميلادٍ صُمّم ليبقى ذكرى جميلةً لكِ"
};
