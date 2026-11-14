import asyncio
import os
import uuid

import bcrypt
from sqlalchemy import select

from app.database import async_session_factory
from app.models import Project, LocalUser


async def seed() -> None:
    password = os.environ["ADMIN_PASSWORD"]
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    async with async_session_factory() as db:
        result = await db.execute(select(Project).where(Project.name == "default"))
        project = result.scalar_one_or_none()
        if project is None:
            project = Project(name="default")
            db.add(project)
            await db.flush()

        result = await db.execute(select(LocalUser).where(LocalUser.username == "admin"))
        user = result.scalar_one_or_none()
        if user is None:
            user = LocalUser(username="admin", password_hash=pw_hash)
            db.add(user)

        await db.commit()
        print("seed ok")


if __name__ == "__main__":
    import selectors
    loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
    try:
        loop.run_until_complete(seed())
    finally:
        loop.close()
