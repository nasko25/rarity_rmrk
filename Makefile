run:
	# npm run codegen
	npm run processor:start

run-rebuild:
	npm run codegen
	# rm db/migrations/LastUnappliedMigration.ts
	npm run db:reset
	# npm run db:create-migration -n migration
	npm run db:migrate
	npm run processor:start

run-build:
	# npm ci
	docker-compose up -d db
	sleep 5		# wait for the db to be built
	npm run processor:migrate
	npm run db:migrate
	npm run processor:start
