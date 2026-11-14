param([string]$BaseUri, [string]$DbUri)
# 建库（忽略已存在）
uv run --with pgserver python -c "
import psycopg, sys
try:
    c = psycopg.connect('$BaseUri', autocommit=True)
    c.execute('CREATE DATABASE protostar_dev')
    c.close()
    print('created')
except psycopg.errors.DuplicateDatabase:
    print('already exists')
except Exception as e:
    print('error:', e); sys.exit(1)
"
Write-Host "DB step exit: $LASTEXITCODE"
