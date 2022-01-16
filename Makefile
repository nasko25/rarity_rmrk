run:
	# npm run codegen
	# while [ true ] ; do npm run processor:start ; sleep 2 ; done
	# npm run processor:start
	while [ true ] ; do npm run processor:start ; sleep 6m ; done

run-rebuild:
	npm run codegen
	# rm db/migrations/LastUnappliedMigration.ts
	npm run db:reset
	# npm run db:create-migration -n migration
	npm run db:migrate
	npm run processor:start

run-build:
	npm ci
	docker-compose up -d db
	sleep 5		# wait for the db to be built
	npm run processor:migrate
	npm run db:migrate
	npm run processor:start

test:
	npm t
