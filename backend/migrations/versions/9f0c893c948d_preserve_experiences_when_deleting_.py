from alembic import op
import sqlalchemy as sa


revision = "9f0c893c948d"
down_revision = "b7a18dcdfaa8"
branch_labels = None
depends_on = None


def upgrade() -> None:

    # 1. Add project_name temporarily as nullable
    op.add_column(
        "experiences",
        sa.Column(
            "project_name",
            sa.String(length=200),
            nullable=True
        )
    )

    # 2. Fill project_name for existing experiences
    op.execute(
        """
        UPDATE experiences e
        SET project_name = p.name
        FROM projects p
        WHERE e.project_id = p.id
        """
    )

    # 3. Handle any experiences whose project no longer exists
    op.execute(
        """
        UPDATE experiences
        SET project_name = 'Unknown Project'
        WHERE project_name IS NULL
        """
    )

    # 4. Now make project_name required
    op.alter_column(
        "experiences",
        "project_name",
        existing_type=sa.String(length=200),
        nullable=False
    )

    # 5. Change project_id foreign key
    #    CASCADE -> SET NULL
    op.drop_constraint(
    "experiences_project_id_fkey",
    "experiences",
    type_="foreignkey"
)
    op.create_foreign_key(
        "fk_experiences_project",
        "experiences",
        "projects",
        ["project_id"],
        ["id"],
        ondelete="SET NULL"
    )

    # 6. Allow project_id to become NULL
    #    when the original project is deleted
    op.alter_column(
        "experiences",
        "project_id",
        existing_type=sa.Integer(),
        nullable=True
    )


def downgrade() -> None:

    # Restore project_id as NOT NULL
    op.alter_column(
        "experiences",
        "project_id",
        existing_type=sa.Integer(),
        nullable=False
    )

    # Restore CASCADE behavior
    op.drop_constraint(
    "experiences_project_id_fkey",
    "experiences",
    type_="foreignkey"
)

    op.create_foreign_key(
        "fk_experiences_project",
        "experiences",
        "projects",
        ["project_id"],
        ["id"],
        ondelete="CASCADE"
    )

    # Remove project_name
    op.drop_column(
        "experiences",
        "project_name"
    )