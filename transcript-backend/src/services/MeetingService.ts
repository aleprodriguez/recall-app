import knex from '../knex';

interface Meeting {
  id: number;
  recall_id: string;
  url: string;
}

export async function getRecents(): Promise<Meeting[]> {
  const date = new Date();
  date.setDate(date.getDate() - 7);

  return (await knex<Meeting>('meetings').select('*').where('created_at', ">", date.toDateString()).orderBy('created_at', 'desc'));
}

export async function create(recallId: string, url: string): Promise<Meeting | undefined> {
    try {
        const [newMeeting] = await knex<Meeting>('meetings').insert({recall_id: recallId, url: url}).returning('*');
        return newMeeting;
      } catch (err) {
        console.error('Transaction failed:', err);
      }
}