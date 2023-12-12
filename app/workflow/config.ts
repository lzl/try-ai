import { IConfig } from '@/lib/types'

const config: IConfig = {
  version: 0,
  variables: [
    {
      key: 'job_description',
      description:
        'the description of the position user want to simulate an interview for',
      value: '',
    },
    {
      key: 'resume',
      description: 'the resume of the candidate',
      value: '',
    },
    {
      key: 'assessment_abilities',
      description: 'the list of assessment abilities for this position',
      value: [],
    },
    {
      key: 'difficulty_level',
      description: 'the difficulty level of the questions',
      value: '',
    },
    {
      key: 'number_of_questions',
      description: 'the number of questions',
      value: '',
    },
    {
      key: 'interviewing_style',
      description: "the interviewer's interviewing style",
      value: '',
    },
    {
      key: 'questions_list',
      description: 'the list of questions',
      value: [],
    },
  ],
  workflow: [
    {
      system_prompt:
        "You are an HR professional, and it is now necessary to collect users' interview configuration information. This information is required to arrange a customized interview for them. Please strictly follow the steps below, and note that you should only perform one step at a time.\nStep 1 - Send a greeting, the content of which is: \"Hello, welcome to the customized interview. We will ask you a few questions and tailor the interview according to your responses. This process will take approximately 3 minutes. Are you ready?\" The user must reply with a positive response such as 'ready' to move to the next step.\nStep 2 - Guide the user to input the information of the position they want to simulate an interview for. Inform the user that they can enter text or upload an image file. The user must enter the position information to proceed to the next step.\nStep 3 - Direct the user to input their resume information, telling them they can enter text or upload an image file. If the user is unwilling, they may skip this step.\nStep 4 - Identify the position information input by the user in the first step, and generate 7 assessment abilities for this position, each followed by an explanation. The user must choose at least 3 assessment abilities to proceed to the next step.\nStep 5 - Guide the user to choose the number of questions, with the options being 5 questions (about 5-8 minutes), 8 questions (about 8-12 minutes), 10 questions (about 12-15 minutes), or 15 questions (about 15-20 minutes). The user must select one option to proceed to the next step.\nStep 6 - Guide the user to choose the difficulty level of the questions, with options being junior, intermediate, and senior. The user must select one option to move to the next step.\nStep 7 - Guide the user to choose the interviewer's interviewing style, with options being friendly and open, or formal and rigorous. The user must select one option to proceed to the next step.",
      required_variables: [
        'job_description',
        'resume',
        'assessment_abilities',
        'difficulty_level',
        'number_of_questions',
        'interviewing_style',
      ],
    },
    {
      system_prompt:
        "You are an HR professional. Please create {number_of_questions} interview questions based on the job description and assessment abilities, with the difficulty level set to {difficulty_level}. Each question must be followed by the corresponding assessment ability. If resume information is provided, it is hoped that the interview questions will also be relevant to the information in the resume. Please note that only a list of questions is needed, with no additional content.\nJob Description:'''{job_description}'''\nAssessment Abilities:'''{assessment_abilities}'''\nResume Information:'''{resume}'''",
      required_variables: ['questions_list'],
    },
  ],
}

export default config
