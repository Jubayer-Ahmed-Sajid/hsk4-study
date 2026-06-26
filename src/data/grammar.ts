export interface GrammarPattern {
  id: number;
  name: string;
  nameEn: string;
  structure: string;
  examples: { c: string; e: string }[];
  mistakes: string[];
}

export const GRAMMAR: GrammarPattern[] = [
  {
    id: 1,
    name: "是...的",
    nameEn: "Shi...de (Emphasis on details)",
    structure: "是 + [focused element] + Verb + 的",
    examples: [
      { c: "你是昨天来的吗？", e: "Did you come yesterday?" },
      { c: "他是坐飞机来的。", e: "He came by plane." },
      { c: "这件事是我做的。", e: "This matter was handled by me." },
      { c: "她是在中国学的中文。", e: "She learned Chinese in China." }
    ],
    mistakes: [
      "Don't use 是...的 for simple descriptions (use 很 instead: 不是'他是高的'而是'他很高')",
      "的 must come at the end of the clause, not after the verb directly",
      "是 cannot be omitted when the focused element comes before the verb"
    ]
  },
  {
    id: 2,
    name: "把",
    nameEn: "Ba (Disposal construction)",
    structure: "Subject + 把 + Object + Verb + Result/Complement",
    examples: [
      { c: "请把门关上。", e: "Please close the door." },
      { c: "我把作业做完了。", e: "I finished the homework." },
      { c: "他把手机弄丢了。", e: "He lost his phone." },
      { c: "妈妈把房间打扫干净了。", e: "Mom cleaned the room." },
      { c: "请把书放在桌子上。", e: "Please put the book on the table." }
    ],
    mistakes: [
      "The object after 把 must be definite/specific (not '我把书买了' but '我把那本书买了')",
      "Negative adverbs (没, 不) must come before 把, not after (正确: 没把...做完)",
      "把 cannot be used with verbs that don't dispose of something (e.g., 是, 在, 有)"
    ]
  },
  {
    id: 3,
    name: "被",
    nameEn: "Bei (Passive voice)",
    structure: "Receiver + 被 + Agent + Verb + Result",
    examples: [
      { c: "我的手机被偷了。", e: "My phone was stolen." },
      { c: "他被老师批评了。", e: "He was criticized by the teacher." },
      { c: "蛋糕被弟弟吃完了。", e: "The cake was eaten up by my younger brother." },
      { c: "窗户被风吹开了。", e: "The window was blown open by the wind." }
    ],
    mistakes: [
      "Don't confuse 被 with 把 — 被 emphasizes the receiver, 把 emphasizes the object being handled",
      "The agent (doer) after 被 can be omitted if unknown: 他被批评了 (no need to say by whom)",
      "被 is for negative/undesirable events in casual speech; 让/叫 is preferred for neutral passives"
    ]
  },
  {
    id: 4,
    name: "比",
    nameEn: "Bi (Comparison)",
    structure: "A + 比 + B + Adjective/Verb",
    examples: [
      { c: "他比我高。", e: "He is taller than me." },
      { c: "今天比昨天冷。", e: "Today is colder than yesterday." },
      { c: "她比我更努力。", e: "She works harder than me." },
      { c: "北京比上海大。", e: "Beijing is bigger than Shanghai." },
      { c: "学中文比学英语难。", e: "Learning Chinese is harder than learning English." }
    ],
    mistakes: [
      "Don't use 很/非常/太 after 比 (not '他比我很高' but '他比我高' or '他比我高得多')",
      "比 requires a clear comparison — don't say '我比他' without a complement",
      "For 'more than' with numbers, use 多 after the number (e.g., 十多个, not 比十多个)"
    ]
  },
  {
    id: 5,
    name: "越来越",
    nameEn: "Yuelaiyue (More and more)",
    structure: "越来越 + Adjective/Verb",
    examples: [
      { c: "天气越来越热了。", e: "The weather is getting warmer and warmer." },
      { c: "他越来越努力。", e: "He becomes more and more hardworking." },
      { c: "中文越来越有意思。", e: "Chinese is becoming more and more interesting." },
      { c: "时间越来越少了。", e: "There's less and less time." }
    ],
    mistakes: [
      "越来越 must be followed by an adjective or stative verb, not a noun",
      "Don't add 了 between 越来越 and the adjective (not '越来越了热')",
      "越来越 implies a gradual change over time, not a sudden one"
    ]
  },
  {
    id: 6,
    name: "一边...一边",
    nameEn: "Yibian...yibian (Doing two things simultaneously)",
    structure: "一边 + Action1 + 一边 + Action2",
    examples: [
      { c: "他一边吃饭一边看电视。", e: "He eats while watching TV." },
      { c: "她一边走路一边听音乐。", e: "She listens to music while walking." },
      { c: "妈妈一边做饭一边唱歌。", e: "Mom sings while cooking." },
      { c: "我喜欢一边喝茶一边看书。", e: "I like reading while drinking tea." }
    ],
    mistakes: [
      "The two actions must be doable simultaneously — you can't '一边睡觉一边跑步'",
      "Don't put 了 or 着 between 一边 and the verb",
      "Both subjects must be the same for both actions (or make two clauses)"
    ]
  },
  {
    id: 7,
    name: "先...然后",
    nameEn: "Xian...ranhou (First...then)",
    structure: "先 + Action1 + 然后 + Action2",
    examples: [
      { c: "先吃饭，然后去看电影。", e: "Eat first, then go watch a movie." },
      { c: "先做作业，然后可以玩游戏。", e: "Do homework first, then you can play games." },
      { c: "先洗手，然后吃饭。", e: "Wash hands first, then eat." },
      { c: "我们先讨论了计划，然后开始执行。", e: "We discussed the plan first, then started implementing it." }
    ],
    mistakes: [
      "先...然后 implies a strict sequence — don't use it when actions can be in any order",
      "然后 can be replaced by 再 for emphasis on the second action happening after",
      "Don't confuse 然后 with 以后 (以后 means 'in the future', 然后 means 'then/next')"
    ]
  },
  {
    id: 8,
    name: "虽然...但是",
    nameEn: "Suiran...danshi (Although...but)",
    structure: "虽然 + Clause1 + 但是/可是 + Clause2",
    examples: [
      { c: "虽然很累，但是很开心。", e: "Although tired, (I'm) very happy." },
      { c: "虽然下雨了，但是我们还是去了。", e: "Although it rained, we still went." },
      { c: "虽然很难，但是我不放弃。", e: "Although it's hard, I won't give up." },
      { c: "虽然他年纪小，但是很聪明。", e: "Although he's young, he's very smart." }
    ],
    mistakes: [
      "Don't use 但是 and 可是 together — they mean the same thing, pick one",
      "虽然 can be followed by 可是, 但是, 还是, or 然而 — but not 所以",
      "In English you can't use 'although...but' together; same in Chinese — 虽然 already implies the contrast"
    ]
  },
  {
    id: 9,
    name: "因为...所以",
    nameEn: "Yinwen...suoyi (Because...so)",
    structure: "因为 + Reason + 所以 + Result",
    examples: [
      { c: "因为下雨，所以取消了活动。", e: "Because it rained, the event was cancelled." },
      { c: "因为他很努力，所以成功了。", e: "Because he worked hard, he succeeded." },
      { c: "因为堵车，所以我迟到了。", e: "Because of traffic, I was late." },
      { c: "因为喜欢，所以选择。", e: "Because I like it, so I chose it." }
    ],
    mistakes: [
      "Don't use 所以 and 但是 together — they contradict each other",
      "因为 can start a sentence mid-way: '他因为生病了，所以没来' (not just at the beginning)",
      "所以 can be omitted in casual speech when the cause-effect is clear from context"
    ]
  },
  {
    id: 10,
    name: "如果...就",
    nameEn: "Ruguo...jiu (If...then)",
    structure: "如果 + Condition + 就 + Result",
    examples: [
      { c: "如果明天不下雨，我们就去公园。", e: "If it doesn't rain tomorrow, we'll go to the park." },
      { c: "如果你有时间，就来我家吧。", e: "If you have time, come to my house." },
      { c: "如果不努力，就不会成功。", e: "If you don't work hard, you won't succeed." },
      { c: "如果有什么问题，就问我。", e: "If you have any questions, just ask me." }
    ],
    mistakes: [
      "就 must follow 如果 — don't use 也 or 还 in the result clause",
      "如果 can be omitted in casual speech: '明天下雨的话，就不去了' (话 replaces 如果...就)",
      "Don't use 了 in the 如果 clause when referring to future conditions"
    ]
  },
  {
    id: 11,
    name: "不但...而且",
    nameEn: "Budan...erqi (Not only...but also)",
    structure: "不但 + Quality/Action1 + 而且 + Quality/Action2",
    examples: [
      { c: "他不但聪明，而且很努力。", e: "He is not only smart but also hardworking." },
      { c: "这道菜不但好吃，而且很便宜。", e: "This dish is not only delicious but also cheap." },
      { c: "她不但会说中文，而且说得很好。", e: "She not only speaks Chinese but speaks it well." },
      { c: "不但学生来了，而且老师也来了。", e: "Not only did the students come, but the teachers came too." }
    ],
    mistakes: [
      "The subject must be the same for both clauses when using 不但...而且",
      "Don't use 也 instead of 而且 — 而且 is required after 不但",
      "不但 can be replaced by 不仅 in more formal writing"
    ]
  },
  {
    id: 12,
    name: "只要...就",
    nameEn: "Zhiyao...jiu (As long as...then)",
    structure: "只要 + Condition + 就 + Result",
    examples: [
      { c: "只要努力，就能成功。", e: "As long as you work hard, you can succeed." },
      { c: "只要你开心，我就开心。", e: "As long as you're happy, I'm happy." },
      { c: "只要多练习，就会进步。", e: "As long as you practice more, you'll improve." },
      { c: "只要不放弃，就有希望。", e: "As long as you don't give up, there's hope." }
    ],
    mistakes: [
      "只要 implies a sufficient condition — don't confuse with 只有 (necessary condition)",
      "就 is required after 只要 — don't use 也 or 还",
      "只要 focuses on sufficiency; 只有 focuses on necessity (only if)"
    ]
  },
  {
    id: 13,
    name: "既...又",
    nameEn: "Ji...you (Both...and)",
    structure: "既 + Quality1 + 又 + Quality2",
    examples: [
      { c: "她既漂亮又聪明。", e: "She is both beautiful and smart." },
      { c: "这个方案既省钱又有效。", e: "This plan is both cost-effective and efficient." },
      { c: "他既会唱歌又会跳舞。", e: "He can both sing and dance." },
      { c: "这道菜既好吃又健康。", e: "This dish is both delicious and healthy." }
    ],
    mistakes: [
      "既...又 connects two equal qualities — both must be adjectives or stative verbs",
      "Don't use 也 instead of 又 — 又 is required after 既",
      "既...又 is for stating facts; 一边...又一边 is for simultaneous actions"
    ]
  }
];
