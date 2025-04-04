import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable('meetings', (table) => {
      table.increments('id').primary();
      table.string('url').notNullable();
      table.string('recall_id').notNullable();
      table.timestamps(true, true);
  });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
    .dropTableIfExists('meetings');
}

